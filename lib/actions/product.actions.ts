'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { getSetting } from './setting.actions'

/* =======================
   CREATE
======================= */
export async function createProduct(input: unknown) {
  try {
    const product = await ProductInputSchema.parseAsync(input)

    const createdProduct = await prisma.products.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        image_path: product.image_path,
        image_2: product.image_2,
        image_3: product.image_3,
        image_4: product.image_4,
        additional_info: product.additional_info,
        active: product.active ?? true,
      },
    })

    revalidatePath('/admin/products')

    return { success: true, message: 'Product créé avec succès', data: createdProduct }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   UPDATE
======================= */
export async function updateProduct(data: {
  id: number
  name: string
  slug: string
  description?: string
  category?: string
  image_path?: string
  image_2?: string
  image_3?: string
  image_4?: string
  additional_info?: string
  active?: boolean
}) {
  try {
    const updatedProduct = await prisma.products.update({
      where: { id: data.id },
      data,
    })

    return { success: true, message: 'Produit mis à jour avec succès', data: updatedProduct }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   DELETE
======================= */
export async function deleteProduct(id: number) {
  try {
    await prisma.products.delete({ where: { id } })
    revalidatePath('/admin/products')
    return { success: true, message: 'Produit supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   GET ONE BY ID
======================= */
export async function getProductById(id: number) {
  const product = await prisma.products.findUnique({
    where: { id },
    include: { product_reviews: true },
  })
  if (!product) throw new Error('Product not found')
  return product
}

/* =======================
   GET ONE BY SLUG
======================= */
export async function getProductBySlug(slug: string) {
  const product = await prisma.products.findUnique({
    where: { slug },
    include: { product_reviews: true },
  })
  if (!product) throw new Error('Product not found')
  return product
}

/* =======================
   GET RELATED PRODUCTS BY CATEGORY
======================= */
export async function getRelatedProductsByCategory({
  category,
  productId,
  page = 1,
  limit = 10,
}: {
  category?: string | null
  productId: number
  page?: number
  limit?: number
}) {
  if (!category) return { data: [], totalPages: 0 }

  const take = limit ?? 10
  const skip = (page - 1) * take

  const [products, totalProducts] = await Promise.all([
    prisma.products.findMany({
      where: { category, id: { not: productId } },
      orderBy: { created_at: 'desc' },
      take,
      skip,
    }),
    prisma.products.count({ where: { category, id: { not: productId } } }),
  ])

  return { data: products, totalPages: Math.ceil(totalProducts / take) }
}

/* =======================
   GET ALL (ADMIN)
======================= */
export async function getAllProductsForAdmin({
  query = '',
  page = 1,
  limit,
}: {
  query?: string
  page?: number
  limit?: number
}) {
  const settings = await getSetting()
  const take = limit ?? 10
  const skip = (page - 1) * take

  const where = query
    ? { name: { contains: query, mode: 'insensitive' } }
    : {}

  const [products, totalProducts] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take,
      skip,
    }),
    prisma.products.count({ where }),
  ])

  return {
    products,
    totalPages: Math.ceil(totalProducts / take),
    totalProducts,
    from: skip + 1,
    to: skip + products.length,
  }
}

/* =======================
   GET ALL CATEGORIES
======================= */
export async function getAllCategories(): Promise<string[]> {
  const categories = await prisma.product_categories.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return categories.map((c: { name: string }) => c.name)
}



/* =======================
   COUNT PRODUCTS
======================= */

export async function countProducts(): Promise<number> {
  return prisma.products.count()
}
