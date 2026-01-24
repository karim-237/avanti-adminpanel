'use server'

import { prisma } from '@/lib/db/prisma'

/**
 * Récupérer la section À propos (unique)
 */
export async function getAboutSection() {
  try {
    return await prisma.about_section.findFirst()
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * Mettre à jour / créer la section À propos
 */
export async function updateAboutSection(data: {
  left_image?: string
  right_image?: string
  main_image?: string
  secondary_image?: string
  video_url?: string
  experience_years?: number
  experience_text?: string
  satisfaction_percent?: number
  satisfaction_text?: string
  products_sold?: string
  products_text?: string
  small_title?: string
  main_title?: string
  description?: string
}) {
  try {
    const existing = await prisma.about_section.findFirst()

    if (existing) {
      await prisma.about_section.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.about_section.create({ data })
    }

    return { success: true, message: 'Section À propos mise à jour' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur lors de la mise à jour' }
  }
}
