'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { BlogInputSchema } from '@/lib/validator'
import { toSlug } from '@/lib/utils'




/* =======================
   FONCTION DE TRADUCTION
======================= */
async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: "fr",
        target: "en",
        format: "text"
      })
    })

    const data = await res.json()
    return data.translatedText || text
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}


/* =======================
   CREATE BLOG
======================= */
export async function createBlog(input: unknown) {
  try {
    const blog = await BlogInputSchema.parseAsync(input)

    const slug =
      blog.slug?.trim() || toSlug(blog.title)

    const validStatus = ['published', 'draft', 'archived']
    const status = validStatus.includes(blog.status ?? '') ? blog.status : 'published'

    const createdBlog = await prisma.blogs.create({
      data: {
        title: blog.title,
        slug,
        short_description: blog.short_description,
        full_content: blog.full_content ?? '',
        paragraph_1: blog.paragraph_1 ?? '',
        paragraph_2: blog.paragraph_2 ?? '',
        author_bio: blog.author_bio ?? 'Nous vous tenons informés grâce à nos articles.',
        image_url: blog.image_url,
        single_image_xl: blog.single_image_xl,
        status,
        featured: blog.featured ?? false,
        category_id: blog.category_id ?? null,
        blog_tags: blog.tag_ids?.length
          ? {
              createMany: {
                data: blog.tag_ids.map((tag_id) => ({ tag_id })),
              },
            }
          : undefined,
      },
      include: {
        blog_categories: true,
        blog_tags: {
          include: { tags: true },
        },
      },
    })


     // ====== TRADUCTION AUTOMATIQUE EN ANGLAIS ======

    const enTitle = await translateToEnglish(blog.title)
    const enShortDesc = blog.short_description
      ? await translateToEnglish(blog.short_description)
      : null

    const enParagraph1 = blog.paragraph_1
      ? await translateToEnglish(blog.paragraph_1)
      : null

    const enParagraph2 = blog.paragraph_2
      ? await translateToEnglish(blog.paragraph_2)
      : null

    const enAuthorBio = blog.author_bio
      ? await translateToEnglish(blog.author_bio)
      : null

    await prisma.blog_translations.create({
      data: {
        blog_id: createdBlog.id,
        lang: "en",
        title: enTitle,
        short_description: enShortDesc,
        paragraph_1: enParagraph1,
        paragraph_2: enParagraph2,
        author_bio: enAuthorBio,
        slug: toSlug(enTitle),
        is_auto: true
      }
    })

    revalidatePath('/admin/blog')

    return { success: true, message: 'Blog créé avec succès', data: createdBlog }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   UPDATE BLOG
======================= */
export async function updateBlog(data: {
  id: number
  title: string
  slug: string
  short_description?: string
  full_content?: string
  paragraph_1?: string
  paragraph_2?: string
  author_bio?: string
  image_url?: string
  single_image?: string
  single_image_xl?: string
  image_secondary?: string
  quote?: string
  status?: string
  featured?: boolean
  category_id?: number
  tag_ids?: number[]
}) {
  try {
    // Supprimer d'abord les tags existants si tag_ids est fourni
    if (data.tag_ids) {
      await prisma.blog_tags.deleteMany({
        where: { blog_id: data.id },
      })
    }

    const updatedBlog = await prisma.blogs.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        short_description: data.short_description,
        full_content: data.full_content,
        paragraph_1: data.paragraph_1,
        paragraph_2: data.paragraph_2,
        author_bio: data.author_bio,
        image_url: data.image_url,
        single_image: data.single_image,
        single_image_xl: data.single_image_xl,
        image_secondary: data.image_secondary,
        quote: data.quote,
        status: data.status,
        featured: data.featured,
        category_id: data.category_id,
        blog_tags: data.tag_ids?.length
          ? {
              createMany: {
                data: data.tag_ids.map((tag_id) => ({ tag_id })),
              },
            }
          : undefined,
      },
      include: {
        blog_categories: true,
        blog_tags: { include: { tags: true } },
      },
    })


     // ===== GESTION TRADUCTION =====

    const existingTranslation = await prisma.blog_translations.findUnique({
  where: {
    blog_id_lang: {
      blog_id: data.id,
      lang: "en"
    }
  }
})

if (existingTranslation && existingTranslation.is_auto) {
  const enTitle = await translateToEnglish(data.title)
  const enShortDesc = data.short_description
    ? await translateToEnglish(data.short_description)
    : null

  const enParagraph1 = data.paragraph_1
    ? await translateToEnglish(data.paragraph_1)
    : null

  const enParagraph2 = data.paragraph_2
    ? await translateToEnglish(data.paragraph_2)
    : null

  const enAuthorBio = data.author_bio
    ? await translateToEnglish(data.author_bio)
    : null

  await prisma.blog_translations.update({
    where: {
      blog_id_lang: {
        blog_id: data.id,
        lang: "en"
      }
    },
    data: {
      title: enTitle,
      short_description: enShortDesc,
      paragraph_1: enParagraph1,
      paragraph_2: enParagraph2,
      author_bio: enAuthorBio,
      slug: toSlug(enTitle),
      updated_at: new Date()
    }
  })
}


    return { success: true, message: 'Blog mis à jour avec succès', data: updatedBlog }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   DELETE BLOG
======================= */
export async function deleteBlog(id: number) {
  try {
    await prisma.blog_tags.deleteMany({ where: { blog_id: id } })
    await prisma.blogs.delete({ where: { id } })

    revalidatePath('/admin/blog')

    return { success: true, message: 'Blog supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET BLOG BY ID
======================= */
export async function getBlogById(id: number) {
  const blog = await prisma.blogs.findUnique({
    where: { id },
    include: {
      blog_views: true,
      comments: true,
      blog_categories: true,
      blog_tags: { include: { tags: true } },
    },
  })

  if (!blog) throw new Error('Blog not found')
  return blog
}

/* =======================
   GET BLOG BY SLUG
======================= */
export async function getBlogBySlug(slug: string) {
  const blog = await prisma.blogs.findUnique({
    where: { slug },
    include: {
      blog_views: true,
      comments: true,
      blog_categories: true,
      blog_tags: { include: { tags: true } },
    },
  })

  if (!blog) throw new Error('Blog not found')
  return blog
}

/* =======================
   GET ALL BLOGS (ADMIN)
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
      include: {
        blog_categories: true,
        blog_tags: { include: { tags: true } },
      },
    }),
    prisma.blogs.count({ where }),
  ])

  const formattedBlogs = blogs.map((b: { blog_categories: { name: any }; blog_tags: any[] }) => ({
    ...b,
    categoryName: b.blog_categories?.name ?? '-',
    tags: b.blog_tags?.map((bt) => bt.tags.name) ?? [],
  }))

  return {
    blogs: formattedBlogs,
    totalPages: Math.ceil(totalBlogs / take),
    totalBlogs,
    from: skip + 1,
    to: skip + blogs.length,
  }
}

/* =======================
   CATEGORIES & TAGS
======================= */
export async function getAllBlogCategories(): Promise<{ id: number; name: string }[]> {
  return prisma.blog_categories.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
}

export async function getAllBlogTags(): Promise<{ id: number; name: string }[]> {
  return prisma.tags.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
}

export async function createBlogCategory(input: { name: string; slug?: string }) {
  try {
    const slug = input.slug?.trim() || toSlug(input.name)

    const category = await prisma.blog_categories.create({
      data: { name: input.name, slug }
    })

    const nameEn = await translateToEnglish(input.name)

    await prisma.blog_category_translations.create({
      data: {
        category_id: category.id,
        lang: "en",
        name: nameEn,
        slug: toSlug(nameEn),
        is_auto: true
      }
    })

    revalidatePath('/admin/blog')

    return { success: true, message: 'Catégorie créée', data: category }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


export async function createBlogTag(input: { name: string; slug?: string }) {
  try {
    const slug = input.slug?.trim() || toSlug(input.name)
    const tag = await prisma.tags.create({ data: { name: input.name, slug } })

     // ===== TRADUCTION AUTOMATIQUE =====
    
        const enName = await translateToEnglish(input.name)
        const enSlug = toSlug(enName)
    
        await prisma.tag_translations.create({
          data: {
            tag_id: tag.id,
            lang: "en",
            name: enName,
            slug: enSlug,
            is_auto: true
          }
        })


    revalidatePath('/admin/blog')
    return { success: true, message: 'Tag créé', data: tag }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   COUNT BLOGS
======================= */
export async function countBlogs(): Promise<number> {
  return prisma.blogs.count()
}

/* =======================
   DELETE CATEGORY
======================= */
export async function deleteBlogCategory(id: number) {
  try {
    // Détacher la catégorie des blogs qui l'utilisent
    await prisma.blogs.updateMany({
      where: { category_id: id },
      data: { category_id: null },
    })

    // Supprimer la catégorie
    await prisma.blog_categories.delete({ where: { id } })

    // Revalidate
    revalidatePath('/admin/blogs/categories')

    return { success: true, message: 'Catégorie supprimée' }
  } catch (error: any) {
    console.error(error)
    return { success: false, message: error.message }
  }
}

/* =======================
   GET ALL CATEGORIES (ADMIN)
======================= */
export async function getAllBlogCategoriesAdmin() {
  return prisma.blog_categories.findMany({ orderBy: { name: 'asc' } })
}

/* =======================
   GET ALL TAGS (ADMIN)
======================= */
export async function getAllBlogTagsAdmin() {
  return prisma.tags.findMany({ orderBy: { name: 'asc' } })
}

/* =======================
   DELETE TAG
======================= */
export async function deleteBlogTag(id: number) {
  try {
    // Supprimer tous les liens avec ce tag
    await prisma.blog_tags.deleteMany({
      where: { tag_id: id },
    })

    // Supprimer le tag
    await prisma.tags.delete({
      where: { id },
    })

    return { success: true, message: 'Tag supprimé avec succès' }
  } catch (error: any) {
    console.error(error)
    return { success: false, message: error.message }
  }
}


/* =======================
   GET TAG BY ID (CORRIGÉ)
======================= */
export async function getBlogTagById(id: number) {
  try {
    // On utilise Prisma directement au lieu de fetch
    const tag = await prisma.tags.findUnique({
      where: { 
        id: id 
      }
    })

    if (!tag) {
      console.error(`Tag avec l'ID ${id} non trouvé dans la base de données.`);
      return null
    }

    return tag
  } catch (error) {
    console.error("Erreur lors de la récupération du tag:", error)
    return null
  }
}

/* =======================
   UPDATE TAG (CORRIGÉ)
======================= */
export async function updateBlogTag({ id, name, slug }: { id: number; name: string; slug: string }) {
  try {
    // Utilisation de Prisma pour mettre à jour directement en base de données
    const updatedTag = await prisma.tags.update({
      where: { id },
      data: {
        name,
        slug: slug.trim() || toSlug(name), // On s'assure d'avoir un slug propre
      },
    })


     // ===== GESTION DE LA TRADUCTION =====
    
        const existingTranslation = await prisma.tag_translations.findFirst({
          where: {
            tag_id: id,
            lang: "en"
          }
        })
    
        if (existingTranslation && existingTranslation.is_auto) {
    
          const enName = await translateToEnglish(name)
          const enSlug = toSlug(enName)
    
          await prisma.tag_translations.update({
            where: { id: existingTranslation.id },
            data: {
              name: enName,
              slug: enSlug,
              updated_at: new Date()
            }
          })
        }

    // On revalide le cache pour que les changements soient visibles sur l'admin
    revalidatePath('/admin/blogs/tags')

    return { 
      success: true, 
      message: 'Tag mis à jour avec succès', 
      data: updatedTag 
    }
  } catch (error) {
    console.error("Erreur Prisma lors de la mise à jour du tag:", error)
    return { 
      success: false, 
      message: formatError(error) // Utilise votre utilitaire formatError existant
    }
  }
}




/* =======================
   UPDATE CATEGORIE (CORRIGÉ)
======================= */

type UpdateBlogCategoryPayload = {
  id: number
  name: string
  slug: string
}

export async function updateBlogCategory(payload: UpdateBlogCategoryPayload) {
  try {
    const { id, name, slug } = payload

    const updatedCategory = await prisma.blog_categories.update({
      where: { id },
      data: {
        name,
        slug,
        updated_at: new Date(),
      },
    })

    const existingTranslation = await prisma.blog_category_translations.findUnique({
      where: { category_id: id }
    })

    if (existingTranslation && existingTranslation.is_auto) {
      const nameEn = await translateToEnglish(name)

      await prisma.blog_category_translations.update({
        where: { category_id: id },
        data: {
          name: nameEn,
          slug: toSlug(nameEn),
          updated_at: new Date()
        }
      })
    }

    return {
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: updatedCategory,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
    }
  }
}



/* ===========================
   GET CATEGORY BY ID (CORRIGÉ)
=========================== */
export async function getBlogCategoryById(id: number) {
  try {
    // On utilise Prisma directement au lieu de fetch
    const category = await prisma.blog_categories.findUnique({
      where: {
        id: id,
      },
    })

    if (!category) {
      console.error(
        `Catégorie avec l'ID ${id} non trouvée dans la base de données.`
      )
      return null
    }

    return category
  } catch (error) {
    console.error(
      'Erreur lors de la récupération de la catégorie:',
      error
    )
    return null
  }
}
