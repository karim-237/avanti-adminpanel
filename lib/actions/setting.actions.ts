'use server'

import { ISettingInput } from '@/types'
import data from '../data'
import { prisma } from '../db/prisma'
import { formatError } from '../utils'
import { cookies } from 'next/headers'
import { about_section, choose_section, home_banners, Setting } from '@prisma/client'
import { AboutChooseData } from '@/types/types'

// Cache global pour éviter de recharger la DB à chaque requête
const globalForSettings = global as unknown as {
  cachedSettings: ISettingInput | null
}

// ----------
// Utils
// ----------

const parseSetting = async (setting: Setting): Promise<ISettingInput> => {
  // On récupère les bannières depuis la DB
  const banners: home_banners[] = await prisma.home_banners.findMany({
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
  })

  const newsletter = await prisma.newsletter_section.findFirst()

  return {
    site: {
      name: setting.site_name ?? '',
      description: setting.site_description ?? '',
      logo: setting.logo_path ?? '',
      favicon: setting.favicon_path ?? '',
      slogan: setting.slogan ?? '',
      url: setting.url ?? '',
      keywords: '',
      email: '',
      phone: '',
      author: '',
      copyright: '',
      address: '',
    },
    common: {
      isMaintenanceMode: setting.maintenance_mode ?? false,
      maintenanceMessage: setting.maintenance_message ?? '',
      defaultTheme: 'light',
      defaultColor: 'default',

    },
    // Injecte les bannières ici !
    carousels: banners.map((b: home_banners) => ({
      id: b.id,
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      description: b.description ?? '',
      image_path: b.image_path,
      active: b.active ?? true,
      position: b.position ?? 0,
    })),
    availableLanguages: [{ code: 'fr', name: 'Français' }],
    defaultLanguage: 'fr',

    // 🔥 AJOUT DE LA VIDÉO
    newsletterVideo: newsletter?.video ?? '',
  }
}

// ----------
// GETTERS
// ----------

export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  const setting = await prisma.setting.findFirst()
  const parsed = setting ? await parseSetting(setting) : data.settings[0]

  console.log('getNoCachedSetting parsed setting:', parsed)

  return parsed
}

export const getSetting = async (): Promise<ISettingInput> => {
  if (!globalForSettings.cachedSettings) {
    console.log('hit db (settings)')
    const setting = await prisma.setting.findFirst()
    globalForSettings.cachedSettings = setting
      ? await parseSetting(setting)
      : data.settings[0]
  }

  return globalForSettings.cachedSettings!
}

// ----------
// getAboutChooseSection
// ----------

export const getAboutChooseSection = async (): Promise<AboutChooseData> => {
  const about = await prisma.about_section.findFirst()
  const choose = await prisma.choose_section.findFirst()
  const benefits = await prisma.choose_benefits.findMany()

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

    chooseBenefits: benefits.length
      ? benefits.map((b: { title: any; description: any }) => ({
        title: b.title ?? '',
        description: b.description ?? '',
      }))
      : [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
  }
}


// ----------
// UPDATE
// ----------

export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    // --- Mise à jour des paramètres généraux ---
    const payload = {
      site_name: newSetting.site.name,
      site_description: newSetting.site.description,
      logo_path: newSetting.site.logo,
      favicon_path: newSetting.site.favicon,
      slogan: newSetting.site.slogan,
      url: newSetting.site.url,
      maintenance_mode: newSetting.common.isMaintenanceMode,
      maintenance_message: newSetting.common.maintenanceMessage,
    }

    // Récupérer l'éventuelle ligne existante
    const existing = await prisma.setting.findFirst()

    let updatedSetting

    if (existing) {
      updatedSetting = await prisma.setting.update({
        where: { id: existing.id },
        data: payload,
      })
    } else {
      updatedSetting = await prisma.setting.create({
        data: payload,
      })
    }




    // --- Mise à jour de la vidéo dans newsletter_section ---
    if (newSetting.newsletterVideo !== undefined) {
      await prisma.newsletter_section.upsert({
        where: { id: 1 }, // ou selon ton identifiant réel
        update: { video: newSetting.newsletterVideo },
        create: { id: 1, video: newSetting.newsletterVideo },
      })
    }

    // --- Mise à jour des bannières ---
    if (newSetting.carousels && newSetting.carousels.length > 0) {
      for (const banner of newSetting.carousels) {
        if (banner.id) {
          await prisma.home_banners.update({
            where: { id: banner.id },
            data: {
              title: banner.title ?? '',
              subtitle: banner.subtitle ?? '',
              description: banner.description ?? '',
              image_path: banner.image_path,
              active: banner.active ?? true,
              position: banner.position ?? 0,
            },
          })
        } else if (banner.image_path) {
          await prisma.home_banners.create({
            data: {
              title: banner.title ?? '',
              subtitle: banner.subtitle ?? '',
              description: banner.description ?? '',
              image_path: banner.image_path,
              active: banner.active ?? true,
              position: banner.position ?? 0,
            },
          })
        }
      }
    }

    // --- Mettre à jour le cache global ---
    globalForSettings.cachedSettings = await parseSetting(updatedSetting)

    return {
      success: true,
      message: 'Paramètres et bannières mis à jour avec succès',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// ----------
// COOKIE (currency)
// ----------

export const setCurrencyOnServer = async (newCurrency: string) => {
  const cookiesStore = await cookies()
  cookiesStore.set('currency', newCurrency)

  return {
    success: true,
    message: 'Currency updated successfully',
  }
}



// ---------- ABOUT SECTION ----------
export const getAboutSection = async () => {
  const about = await prisma.about_section.findFirst()
  return about ?? null
}

export const updateAboutSection = async (data: Partial<about_section>) => {
  try {
    const updated = await prisma.about_section.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
    return { success: true, data: updated }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

// ---------- CHOOSE SECTION ----------
export const getChooseSection = async () => {
  const choose = await prisma.choose_section.findFirst()
  return choose ?? null
}

export const updateChooseSection = async (data: Partial<choose_section>) => {
  try {
    const updated = await prisma.choose_section.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
    return { success: true, data: updated }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
