'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError, toSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { RecipeInputSchema } from '@/lib/validator'


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
   CREATE RECIPE
======================= */
export async function createRecipe(input: unknown) {
  try {
    const recipe = await RecipeInputSchema.parseAsync(input)
    const slug = recipe.slug?.trim() || toSlug(recipe.title)
    const categoryId = recipe.category_id ? Number(recipe.category_id) : undefined

    // ⚡ Gestion des tag_ids
    const tagIds: number[] = Array.isArray(recipe.tag_ids)
      ? recipe.tag_ids.map(Number)
      : typeof recipe.tag_ids === 'string' && recipe.tag_ids.length
        ? recipe.tag_ids.split(',').map(Number)
        : []

    const createdRecipe = await prisma.recipes.create({
      data: {
        title: recipe.title,
        slug,
        short_description: recipe.short_description,
        image: recipe.image,
        status: recipe.status ?? 'draft',
        is_active: recipe.is_active ?? true,
        category_id: categoryId,
        paragraph_1: recipe.paragraph_1,
        paragraph_2: recipe.paragraph_2,
        image_url: recipe.image_url,
        recipesPostTags: tagIds.length
          ? { createMany: { data: tagIds.map(tag_id => ({ tag_id })) } }
          : undefined,
      },
      include: {
        recipe_categories: true,
        recipesPostTags: { include: { tags: true } },
      },
    })

     // ====== TRADUCTION AUTOMATIQUE EN ANGLAIS ======

    const enTitle = await translateToEnglish(recipe.title)

    const enShortDesc = recipe.short_description
      ? await translateToEnglish(recipe.short_description)
      : null

    const enParagraph1 = recipe.paragraph_1
      ? await translateToEnglish(recipe.paragraph_1)
      : null

    const enParagraph2 = recipe.paragraph_2
      ? await translateToEnglish(recipe.paragraph_2)
      : null

    await prisma.recipe_translations.create({
      data: {
        recipe_id: createdRecipe.id,
        lang: "en",
        title: enTitle,
        short_description: enShortDesc,
        paragraph_1: enParagraph1,
        paragraph_2: enParagraph2,
        slug: toSlug(enTitle),
        is_auto: true
      }
    })


    revalidatePath('/admin/recipes')

    return { success: true, message: 'Recette créée avec succès', data: createdRecipe }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   UPDATE RECIPE
======================= */
export async function updateRecipe(data: {
  id: number
  title: string
  slug: string
  short_description?: string
  content?: string
  image?: string
  status?: string
  is_active?: boolean
  category_id?: number
  paragraph_1?: string
  paragraph_2?: string
  image_url?: string
  tag_ids?: number[] | string
}) {
  try {
    const { id, tag_ids, ...rest } = data

    // ⚡ Conversion tag_ids en array de nombres
    const tagIds: number[] = Array.isArray(tag_ids)
      ? tag_ids.map(Number)
      : typeof tag_ids === 'string' && tag_ids.length
        ? tag_ids.split(',').map(Number)
        : []

    // Supprimer les anciens liens tags
    await prisma.recipes_post_tags.deleteMany({ where: { recipe_id: id } })

    // Mettre à jour la recette
    const updatedRecipe = await prisma.recipes.update({
      where: { id },
      data: {
        title: rest.title,
        slug: rest.slug,
        short_description: rest.short_description,
        content: rest.content,
        image: rest.image,
        status: rest.status,
        is_active: rest.is_active,
        paragraph_1: rest.paragraph_1,
        paragraph_2: rest.paragraph_2,
        image_url: rest.image_url,

        // ✅ Relation catégorie propre (au lieu de category_id brut)
        recipe_categories: rest.category_id
          ? { connect: { id: rest.category_id } }
          : { disconnect: true },

        recipesPostTags: tagIds.length
          ? { createMany: { data: tagIds.map(tag_id => ({ tag_id })) } }
          : undefined,
      },
      include: {
        recipe_categories: true,
        recipesPostTags: { include: { tags: true } },
      },
    })

     // ===== GESTION TRADUCTION =====
const existingTranslation = await prisma.recipe_translations.findUnique({
  where: {
    recipe_id_lang: {
      recipe_id: id,
      lang: "en"
    }
  }
})

if (existingTranslation && existingTranslation.is_auto) {
  const enTitle = await translateToEnglish(rest.title)

  const enShortDesc = rest.short_description
    ? await translateToEnglish(rest.short_description)
    : null

  const enParagraph1 = rest.paragraph_1
    ? await translateToEnglish(rest.paragraph_1)
    : null 

  const enParagraph2 = rest.paragraph_2
    ? await translateToEnglish(rest.paragraph_2)
    : null

  await prisma.recipe_translations.update({
    where: {
      recipe_id_lang: {
        recipe_id: id,
        lang: "en"
      }
    },
    data: {
      title: enTitle,
      short_description: enShortDesc,
      paragraph_1: enParagraph1,
      paragraph_2: enParagraph2,
      slug: toSlug(enTitle),
    }
  })
}


    return { success: true, message: 'Recette mise à jour avec succès', data: updatedRecipe }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}



/* =======================
   DELETE RECIPE
======================= */
export async function deleteRecipe(id: number) {
  try {
    // 1️⃣ Supprimer les liens recette <-> tags
    await prisma.recipes_post_tags.deleteMany({
      where: { recipe_id: id },
    })

    // 2️⃣ Supprimer la recette
    await prisma.recipes.delete({
      where: { id },
    })

    revalidatePath('/admin/recipes')

    return { success: true, message: 'Recette supprimée avec succès' }
  } catch (error) {
    console.error('deleteRecipe error:', error)
    return { success: false, message: formatError(error) }
  }
}


/* =======================
   GET ONE RECIPE BY ID
======================= */
export async function getRecipeById(id: number) {
  const recipe = await prisma.recipes.findUnique({
    where: { id },
    include: {
      recipesPostTags: { include: { tags: true } },
      recipe_categories: true,
    },
  })
  if (!recipe) throw new Error('Recette non trouvée')

  return {
    ...recipe,
    category_id: recipe.category_id ?? recipe.recipe_categories?.id ?? undefined,
    tag_ids: recipe.recipesPostTags?.map((r: { tag_id: any }) => r.tag_id) ?? [],
  }
}


/* =======================
   GET ONE RECIPE BY SLUG
======================= */
export async function getRecipeBySlug(slug: string) {
  const recipe = await prisma.recipes.findUnique({
    where: { slug },
    include: {
      recipesPostTags: { include: { tags: true } },
      recipe_categories: true,
    },
  })
  if (!recipe) throw new Error('Recette non trouvée')

  return {
    ...recipe,
    category_id: recipe.category_id ?? recipe.recipe_categories?.id ?? undefined,
    tag_ids: recipe.recipesPostTags?.map((r: { tag_id: any }) => r.tag_id) ?? [],
  }
}

/* =======================
   GET ALL RECIPES (ADMIN)
======================= */
export async function getAllRecipesForAdmin({
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

  const where = query ? { title: { contains: query, mode: 'insensitive' } } : {}

  const [recipes, totalRecipes] = await Promise.all([
    prisma.recipes.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take,
      include: {
        recipe_categories: true,
        recipesPostTags: { include: { tags: true } },
      },
    }),
    prisma.recipes.count({ where }),
  ])

  const formattedRecipes = recipes.map((r: any) => ({
    ...r,
    categoryName: r.recipe_categories?.name ?? '-',
    tags: r.recipesPostTags?.map((t: { tags: { name: any } }) => t.tags.name) ?? [],
  }))

  return {
    recipes: formattedRecipes,
    totalPages: Math.ceil(totalRecipes / take),
    totalRecipes,
    from: skip + 1,
    to: skip + recipes.length,
  }
}

/* =======================
   CATEGORIES & TAGS RECIPES
======================= */
export async function getAllRecipeCategories(): Promise<{ id: number; name: string, slug: string }[]> {
  return prisma.recipe_categories.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}

export async function getAllRecipeTags(): Promise<{ id: number; name: string, slug: string }[]> {
  return prisma.tags.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}

export async function createRecipeCategory(input: { name: string; slug?: string }) {
  try {
    const slug = input.slug?.trim() || toSlug(input.name)

    const category = await prisma.recipe_categories.create({
      data: { name: input.name, slug }
    })

    const nameEn = await translateToEnglish(input.name)

    await prisma.recipe_category_translations.create({
      data: {
        category_id: category.id,
        lang: "en",
        name: nameEn,
        slug: toSlug(nameEn),
        is_auto: true
      }
    })

    revalidatePath('/admin/recipes')

    return { success: true, message: 'Catégorie créée', data: category }

  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


export async function createRecipeTag(input: { name: string; slug?: string }) {
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
    revalidatePath('/admin/recipes')
    return { success: true, message: 'Tag créé', data: tag }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateRecipeCategory({ id, name, slug }: { id: number; name: string; slug: string }) {
  try {
    const updatedCategory = await prisma.recipe_categories.update({
      where: { id },
      data: { name, slug, updated_at: new Date() },
    })

    const existingTranslation = await prisma.recipe_category_translations.findUnique({
      where: { category_id: id }
    })

    if (existingTranslation && existingTranslation.is_auto) {
      const nameEn = await translateToEnglish(name)

      await prisma.recipe_category_translations.update({
        where: { category_id: id },
        data: {
          name: nameEn,
          slug: toSlug(nameEn),
          updated_at: new Date()
        }
      })
    }

    return { success: true, message: 'Catégorie mise à jour', data: updatedCategory }

  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


export async function updateRecipeTag({ id, name, slug }: { id: number; name: string; slug: string }) {
  try {
    const updatedTag = await prisma.tags.update({
      where: { id },
      data: { name, slug: slug.trim() || toSlug(name) },
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

    
    return { success: true, message: 'Tag mis à jour', data: updatedTag }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteRecipeCategory(id: number) {
  try {
    await prisma.recipes.updateMany({ where: { category_id: id }, data: { category_id: null } })
    await prisma.recipe_categories.delete({ where: { id } })
    revalidatePath('/admin/recipes/categories')
    return { success: true, message: 'Catégorie supprimée' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteRecipeTag(id: number) {
  try {
    await prisma.recipes_post_tags.deleteMany({ where: { tag_id: id } })
    await prisma.tags.delete({ where: { id } })
    revalidatePath('/admin/recipes/tags')
    return { success: true, message: 'Tag supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getRecipeTagById(id: number) {
  return prisma.tags.findUnique({ where: { id } })
}

export async function getRecipeCategoryById(id: number) {
  return prisma.recipe_categories.findUnique({ where: { id } })
}


/* =======================
   COUNT RECIPES
======================= */

export async function countRecipes(): Promise<number> {
  return prisma.recipes.count()
}