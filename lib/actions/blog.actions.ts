'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  BlogInputSchema,
  BlogUpdateSchema,
} from '@/lib/validator'
import { getSetting } from './setting.actions'
import { toSlug } from '@/lib/utils'


/* =======================
   CREATE
======================= */
export async function createBlog(input: unknown) {
  try {
    const blog = await BlogInputSchema.parseAsync(input)

    const slug =
      blog.slug && blog.slug.trim() !== ''
        ? blog.slug
        : toSlug(blog.title)
    const category = blog.category && blog.category.trim() !== '' ? blog.category : 'All' // ✅ par défaut    
    const validStatus = ['published', 'draft', 'archived']
    const status =
      blog.status && validStatus.includes(blog.status)
        ? blog.status
        : 'published'; // ✅ valeur par défaut si vide ou invalide


    const createdBlog = await prisma.blogs.create({
      data: {
        title: blog.title,
        slug, // ✅ slug garanti
        short_description: blog.short_description,
        category,
        image_url: blog.image_url,
        single_image_xl: blog.single_image_xl,
        status,
        featured: blog.featured ?? false,
      },
    })

    revalidatePath('/admin/blog')

    return {
      success: true,
      message: 'Blog créé avec succès',
      data: createdBlog,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


/* =======================
   UPDATE
======================= */
export async function updateBlog(data: {
  id: number
  title: string
  slug: string
  short_description?: string
  full_content?: string
  category?: string
  image_url?: string
  paragraph_1?: string
  paragraph_2?: string
  author_bio?: string
  single_image?: string
  single_image_xl?: string
  image_secondary?: string
  quote?: string
  status?: string
  featured?: boolean
}) {
  try {
    const updatedBlog = await prisma.blogs.update({
      where: { id: data.id },
      data,
    })

    return {
      success: true,
      message: 'Blog mis à jour avec succès',
      data: updatedBlog,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   DELETE
======================= */
export async function deleteBlog(id: number) {
  try {
    await prisma.blogs.delete({
      where: { id },
    })

    revalidatePath('/admin/blog')

    return {
      success: true,
      message: 'Blog supprimé avec succès',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET ONE BY ID
======================= */
export async function getBlogById(id: number) {
  const blog = await prisma.blogs.findUnique({
    where: { id },
    include: {
      blog_views: true,
      comments: true,
    },
  })

  if (!blog) throw new Error('Blog not found')
  return blog
}

/* =======================
   GET ONE BY SLUG
======================= */
export async function getBlogBySlug(slug: string) {
  const blog = await prisma.blogs.findUnique({
    where: { slug },
    include: {
      blog_views: true,
      comments: true,
    },
  })

  if (!blog) throw new Error('Blog not found')
  return blog
}

/* =======================
   GET ALL (ADMIN)
======================= */
export async function getAllBlogsForAdmin({
  query = '',
  page = 1,
  limit,
}: {
  query?: string
  page?: number
  limit?: number
}) {
  
  const take = limit || 10
  const skip = (page - 1) * take

  const where = query
    ? { title: { contains: query, mode: 'insensitive' } }
    : {}

  const [blogs, totalBlogs] = await Promise.all([
    prisma.blogs.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.blogs.count({ where }),
  ])

  return {
    blogs,
    totalPages: Math.ceil(totalBlogs / take),
    totalBlogs,
    from: skip + 1,
    to: skip + blogs.length,
  }
}

/* =======================
   GET ALL CATEGORIES
======================= */
export async function getAllBlogCategories(): Promise<string[]> {
  const categories = await prisma.blog_categories.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })

  return categories.map((c: { name: any }) => c.name)
}


/* =======================
   COUNT BLOGS
======================= */

export async function countBlogs(): Promise<number> {
  return prisma.blogs.count()
}
