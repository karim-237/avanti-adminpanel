'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'

export type GetReviewsParams = {
  productId: number
  page?: number
  limit?: number
}

export async function getReviews({
  productId,
  page = 1,
  limit = 5,
}: GetReviewsParams) {
  try {
    const skip = (page - 1) * limit

    const [reviews, totalReviews] = await Promise.all([
      prisma.product_reviews.findMany({
        where: { product_id: productId },
        include: { products: false }, // on peut inclure l'utilisateur si besoin
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product_reviews.count({ where: { product_id: productId } }),
    ])

    return {
      data: reviews,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews,
    }
  } catch (error) {
    throw new Error(formatError(error))
  }
}

export async function getReviewByProductId({
  productId,
  userId,
}: {
  productId: number
  userId?: string
}) {
  try {
    if (!userId) return null
    const review = await prisma.product_reviews.findFirst({
      where: { product_id: productId, email: userId }, // ici userId correspond à email
    })
    return review
  } catch (error) {
    throw new Error(formatError(error))
  }
}

export async function createUpdateReview({
  data,
  userEmail,
}: {
  data: {
    productId: number
    title: string
    comment: string
    rating: number
  }
  userEmail: string
}) {
  try {
    const existingReview = await prisma.product_reviews.findFirst({
      where: { product_id: data.productId, email: userEmail },
    })

    let review
    if (existingReview) {
      review = await prisma.product_reviews.update({
        where: { id: existingReview.id },
        data: {
          title: data.title,
          comment: data.comment,
          rating: data.rating,
        },
      })
    } else {
      review = await prisma.product_reviews.create({
        data: {
          product_id: data.productId,
          email: userEmail,
          name: userEmail,
          title: data.title,
          comment: data.comment,
          rating: data.rating,
        },
      })
    }

    return { success: true, message: 'Review submitted successfully', data: review }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
