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
        slug,
        short_description: blog.short_description,
        image_url: blog.image_url,
        single_image_xl: blog.single_image_xl,
        status,
        featured: blog.featured ?? false,
        category_id: blog.category_id ?? null,
        blog_tags: blog.tag_ids?.length
          ? {
            createMany: {
              data: blog.tag_ids.map((id: number) => ({
                tag_id: id,
              })),
            },
          }
          : undefined,
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
export async function getAllBlogCategories(): Promise<
  { id: number; name: string }[]
> {
  return prisma.blog_categories.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
}


/* =======================
   COUNT BLOGS
======================= */

export async function countBlogs(): Promise<number> {
  return prisma.blogs.count()
}


/* =======================
   CREATE CATEGORY
======================= */
export async function createBlogCategory(input: {
  name: string
  slug?: string
}) {
  try {
    const slug =
      input.slug && input.slug.trim() !== ''
        ? input.slug
        : toSlug(input.name)

    const category = await prisma.blog_categories.create({
      data: { name: input.name, slug },
    })

    revalidatePath('/admin/blog')

    return { success: true, message: 'Catégorie créée', data: category }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   CREATE TAG
======================= */
export async function createBlogTag(input: {
  name: string
  slug?: string
}) {
  try {
    const slug =
      input.slug && input.slug.trim() !== ''
        ? input.slug
        : toSlug(input.name)

    const tag = await prisma.tags.create({
      data: { name: input.name, slug },
    })

    revalidatePath('/admin/blog')

    return { success: true, message: 'Tag créé', data: tag }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET ALL TAGS
======================= */
export async function getAllBlogTags(): Promise<
  { id: number; name: string }[]
> {
  return prisma.tags.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
}

/* =======================
   GET ALL CATEGORIES (ADMIN)
======================= */
export async function getAllBlogCategoriesAdmin() {
  return prisma.blog_categories.findMany({
    orderBy: { name: 'asc' },
  })
}

/* =======================
   DELETE CATEGORY
======================= */
export async function deleteBlogCategory(id: number) {
  try {
    await prisma.blog_categories.delete({
      where: { id },
    })

    revalidatePath('/admin/blogs/categories')

    return { success: true, message: 'Catégorie supprimée' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET ALL TAGS (ADMIN)
======================= */
export async function getAllBlogTagsAdmin() {
  return prisma.tags.findMany({
    orderBy: { name: 'asc' },
  })
}

/* =======================
   DELETE TAG
======================= */
export async function deleteBlogTag(id: number) {
  try {
    await prisma.tags.delete({
      where: { id },
    })

    revalidatePath('/admin/blogs/tags')

    return { success: true, message: 'Tag supprimé' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
