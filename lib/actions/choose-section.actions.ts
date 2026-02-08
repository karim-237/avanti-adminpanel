'use server'

import { prisma } from '@/lib/db/prisma'

export async function getChooseSection() {
  try {
    return await prisma.choose_section.findFirst()
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateChooseSection(data: {
  subtitle?: string
  title?: string
  description?: string
  active?: boolean
}) {
  try {
    const existing = await prisma.choose_section.findFirst()

    if (existing) {
      await prisma.choose_section.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.choose_section.create({ data })
    }

    return { success: true, message: 'Section mise à jour' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur de mise à jour' }
  }
}
