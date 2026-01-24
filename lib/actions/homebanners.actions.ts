'use server'

import { prisma } from '../db/prisma'

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
