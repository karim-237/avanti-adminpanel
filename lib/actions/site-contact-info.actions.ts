'use server'

import { prisma } from '@/lib/db/prisma'

export async function getSiteContactInfo() {
  try {
    return await prisma.site_contact_info.findFirst()
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateSiteContactInfo(data: {
  address_text?: string
  address_url?: string
  phone_numbers: string[]
  emails: string[]
  map_url?: string
}) {
  try {
    const existing = await prisma.site_contact_info.findFirst()

    if (existing) {
      await prisma.site_contact_info.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.site_contact_info.create({
        data,
      })
    }

    return { success: true, message: 'Informations de contact mises à jour' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur lors de la mise à jour' }
  }
}
