'use server'

import { prisma } from '@/lib/db/prisma'
import { AboutChooseData } from '@/types/types'

/**
 * Récupérer la section About + ses 3 services
 */
export async function getAboutChooseSection(): Promise<AboutChooseData> {
  try {
    const about = await prisma.about_section.findFirst()
    const choose = await prisma.choose_section.findFirst()

    const chooseBenefits = await prisma.choose_benefits.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      take: 3,
    })

    return {
      about: {
        main_title: about?.main_title ?? '',
        description: about?.description ?? '',
        left_image: about?.left_image ?? '',
        right_image: about?.right_image ?? '',
      },

      choose: {
        title: choose?.title ?? '',
        description: choose?.description ?? '',
        why_us: choose?.why_us ?? '',
      },

      chooseBenefits: chooseBenefits.length
        ? chooseBenefits.map((b: { title: any; description: any }) => ({
            title: b.title ?? '',
            description: b.description ?? '',
          }))
        : [
            { title: '', description: '' },
            { title: '', description: '' },
            { title: '', description: '' },
          ],
    }
  } catch (error) {
    console.error(error)

    return {
      about: { main_title: '', description: '', left_image: '', right_image: '' },
      choose: { title: '', description: '', why_us: '' },
      chooseBenefits: [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
    }
  }
}

/**
 * Mettre à jour la section About + services
 */
export async function updateAboutChooseSection(data: {
  about: { main_title?: string; description?: string; left_image?: string; right_image?: string; why_us?: string }
  chooseBenefits: { title: string; description: string }[]
}) {
  try {
    // 1️⃣ Update / create About Section
    const existing = await prisma.about_section.findFirst()
    let aboutId: number

    if (existing) {
      await prisma.about_section.update({
        where: { id: existing.id },
        data: {
          main_title: data.about.main_title,
          description: data.about.description,
          left_image: data.about.left_image,
          right_image: data.about.right_image,
          why_us: data.about.why_us,
        },
      })
      aboutId = existing.id
    } else {
      const created = await prisma.about_section.create({
        data: {
          main_title: data.about.main_title,
          description: data.about.description,
          left_image: data.about.left_image,
          right_image: data.about.right_image,
          why_us: data.about.why_us,
        },
      })
      aboutId = created.id
    }

    // 2️⃣ Update / create Choose Benefits (3 services)
    for (let i = 0; i < data.chooseBenefits.length; i++) {
      const benefit = data.chooseBenefits[i]
      const existingBenefit = await prisma.choose_benefits.findFirst({
        where: { position: i + 1 },
      })

      if (existingBenefit) {
        await prisma.choose_benefits.update({
          where: { id: existingBenefit.id },
          data: {
            title: benefit.title,
            description: benefit.description,
          },
        })
      } else {
        await prisma.choose_benefits.create({
          data: {
            title: benefit.title,
            description: benefit.description,
            position: i + 1,
            active: true,
          },
        })
      }
    }

    return { success: true, message: 'Section À propos et services mise à jour' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur lors de la mise à jour de la section' }
  }
}
