'use server'

import { prisma } from '@/lib/db/prisma'
import { formatError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

/* =======================
   GET ALL MESSAGES (ADMIN)
======================= */
export async function getAllMessagesForAdmin({
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
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {}

  const [messages, totalMessages] = await Promise.all([
    prisma.contact_messages.findMany({
      where,
      orderBy: { id: 'desc' },
      take,
      skip,
    }),
    prisma.contact_messages.count({ where }),
  ])

  return {
    messages,
    totalPages: Math.ceil(totalMessages / take),
    totalMessages,
    from: skip + 1,
    to: skip + messages.length,
  }
}

/* =======================
   GET MESSAGE BY ID
======================= */
export async function getMessageById(id: number) {
  const message = await prisma.contact_messages.findUnique({
    where: { id },
  })
  if (!message) throw new Error('Message introuvable')
  return message
}

/* =======================
   DELETE MESSAGE
======================= */
export async function deleteMessage(id: number) {
  try {
    await prisma.contact_messages.delete({ where: { id } })
    revalidatePath('/admin/messages') // revalide la page liste
    return { success: true, message: 'Message supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
