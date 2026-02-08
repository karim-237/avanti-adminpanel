'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

/* =======================
   GET ALL (ADMIN)
======================= */
export async function getAllNewsletterEmails({
  query = '',
  page = 1,
  limit = 10,
}: {
  query?: string
  page?: number
  limit?: number
}) {
  const take = limit
  const skip = (page - 1) * take

  const where = query
    ? { email: { contains: query, mode: 'insensitive' } }
    : {}

  const [emails, totalEmails] = await Promise.all([
    prisma.newsletter_emails.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take,
      skip,
    }),
    prisma.newsletter_emails.count({ where }),
  ])

  return {
    emails,
    totalPages: Math.ceil(totalEmails / take),
    totalEmails,
    from: skip + 1,
    to: skip + emails.length,
  }
}

/* =======================
   DELETE EMAIL
======================= */
export async function deleteNewsletterEmail(id: number) {
  try {
    await prisma.newsletter_emails.delete({ where: { id } })
    revalidatePath('/admin/newsletters')

    return { success: true, message: 'Email supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

/* =======================
   COUNT EMAILS
======================= */
export async function countNewsletterEmails(): Promise<number> {
  return prisma.newsletter_emails.count()
}
