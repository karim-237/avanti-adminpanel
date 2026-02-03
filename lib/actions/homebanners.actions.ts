'use server'

import { prisma } from '../db/prisma'


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


export async function getHomeBanners() {
  try {
    const banners = await prisma.home_banners.findMany({
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    })

    // On garantit toujours 4 bannières
    const filledBanners = Array.from({ length: 4 }, (_, i) => {
      return banners[i] ?? { id: undefined, title: '', subtitle: '', description: '', image_path: '', position: i, active: true }
    })

    return { success: true, data: filledBanners }
  } catch (err) {
    console.error('getHomeBanners error:', err)
    return { success: false, message: 'Erreur lors du chargement des bannières' }
  }
}

export async function createHomeBanner(payload: {
  title?: string
  subtitle?: string
  description?: string
  image_path: string
  position?: number
  active?: boolean
}) {
  try {
    const banner = await prisma.home_banners.create({
      data: {
        title: payload.title ?? null,
        subtitle: payload.subtitle ?? null,
        description: payload.description ?? null,
        image_path: payload.image_path,
        position: payload.position ?? 0,
        active: payload.active ?? true,
      },
    })

       // ===== TRADUCTION AUTOMATIQUE =====

    const enTitle = payload.title
      ? await translateToEnglish(payload.title)
      : null

    const enSubtitle = payload.subtitle
      ? await translateToEnglish(payload.subtitle)
      : null

    const enDescription = payload.description
      ? await translateToEnglish(payload.description)
      : null

    await prisma.home_banner_translations.create({
      data: {
        banner_id: banner.id,
        lang: "en",
        title: enTitle,
        subtitle: enSubtitle,
        description: enDescription,
        is_auto: true
      }
    })

    return { success: true, data: banner, message: 'Bannière créée avec succès' }
  } catch (err) {
    console.error('createHomeBanner error:', err)
    return { success: false, message: 'Erreur lors de la création de la bannière' }
  }
}

export async function updateHomeBanner(payload: {
  id: number
  title?: string
  subtitle?: string
  description?: string
  image_path?: string
  position?: number
  active?: boolean
}) {
  try {
    const banner = await prisma.home_banners.update({
      where: { id: payload.id },
      data: {
        title: payload.title ?? undefined,
        subtitle: payload.subtitle ?? undefined,
        description: payload.description ?? undefined,
        image_path: payload.image_path ?? undefined,
        position: payload.position ?? undefined,
        active: payload.active ?? undefined,
        updated_at: new Date(),
      },
    })

    // ===== GESTION DE LA TRADUCTION =====

    const existingTranslation = await prisma.home_banner_translations.findFirst({
      where: {
        banner_id: payload.id,
        lang: "en"
      }
    })

    if (existingTranslation && existingTranslation.is_auto) {

      const enTitle = payload.title
        ? await translateToEnglish(payload.title)
        : existingTranslation.title

      const enSubtitle = payload.subtitle
        ? await translateToEnglish(payload.subtitle)
        : existingTranslation.subtitle

      const enDescription = payload.description
        ? await translateToEnglish(payload.description)
        : existingTranslation.description

      await prisma.home_banner_translations.update({
        where: { id: existingTranslation.id },
        data: {
          title: enTitle,
          subtitle: enSubtitle,
          description: enDescription,
          updated_at: new Date()
        }
      })
    }

    return { success: true, data: banner, message: 'Bannière mise à jour' }
  } catch (err) {
    console.error('updateHomeBanner error:', err)
    return { success: false, message: 'Erreur lors de la mise à jour de la bannière' }
  }
}

export async function deleteHomeBanner(id: number) {
  try {
    await prisma.home_banners.delete({ where: { id } })
    return { success: true, message: 'Bannière supprimée' }
  } catch (err) {
    console.error('deleteHomeBanner error:', err)
    return { success: false, message: 'Erreur lors de la suppression de la bannière' }
  }
}
