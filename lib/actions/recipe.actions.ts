'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import {
  RecipeInputSchema,
  RecipeUpdateSchema,
} from '@/lib/validator'
import { getSetting } from './setting.actions'
import { toSlug } from '@/lib/utils'

/* =======================
   CREATE
======================= */
export async function createRecipe(input: unknown) {
  try {
    const recipe = await RecipeInputSchema.parseAsync(input)
    const slug =
      recipe.slug && recipe.slug.trim() !== ''
        ? recipe.slug
        : toSlug(recipe.title)
    const categoryId = recipe.category_id
      ? Number(recipe.category_id) // ⚡ converti string -> number
      : undefined;

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

      },
    })

    revalidatePath('/admin/recipes')

    return {
      success: true,
      message: 'Recette créée avec succès',
      data: createdRecipe,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   UPDATE
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
}) {
 try {
    const { id, ...rest } = data // <-- on enlève id
    const updatedRecipe = await prisma.recipes.update({
      where: { id },
      data: rest, // <-- id n’est plus inclus
    })

    return {
      success: true,
      message: 'Recette mise à jour avec succès',
      data: updatedRecipe,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   DELETE
======================= */
export async function deleteRecipe(id: number) {
  try {
    await prisma.recipes.delete({
      where: { id },
    })

    revalidatePath('/admin/recipes')

    return {
      success: true,
      message: 'Recette supprimée avec succès',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET ONE BY ID
======================= */
export async function getRecipeById(id: number) {
  const recipe = await prisma.recipes.findUnique({
    where: { id },
    include: {
      recipe_comments: true,
    },
  })

  if (!recipe) throw new Error('Recipe not found')
  return recipe
}

/* =======================
   GET ONE BY SLUG
======================= */
export async function getRecipeBySlug(slug: string) {
  const recipe = await prisma.recipes.findUnique({
    where: { slug },
    include: {
      recipe_comments: true,
    },
  })

  if (!recipe) throw new Error('Recipe not found')
  return recipe
}

/* =======================
   GET ALL (ADMIN)
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

  const where = query
    ? { title: { contains: query, mode: 'insensitive' } }
    : {}

  const [recipes, totalRecipes] = await Promise.all([
    prisma.recipes.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.recipes.count({ where }),
  ])

  return {
    recipes,
    totalPages: Math.ceil(totalRecipes / take),
    totalRecipes,
    from: skip + 1,
    to: skip + recipes.length,
  }
}

/* =======================
   GET ALL CATEGORIES
======================= */
export async function getAllRecipeCategories(): Promise<string[]> {
  const categories = await prisma.recipe_categories.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })

  return categories.map((c: { name: any }) => c.name)
}


/* =======================
   COUNT RECIPES
======================= */

export async function countRecipes(): Promise<number> {
  return prisma.recipes.count()
}
