import { ISettingInput } from '@/types'
import { HomeBanner } from '@/hooks/use-home-banners'

export function normalizeSetting(
  input?: Partial<ISettingInput>
): ISettingInput {
  return {
    site: {
      name: input?.site?.name ?? '',
      description: input?.site?.description ?? '',
      logo: input?.site?.logo ?? '',
      favicon: input?.site?.favicon ?? '',
      slogan: input?.site?.slogan ?? '',
      url: input?.site?.url ?? '',
      keywords: input?.site?.keywords ?? '',
      email: input?.site?.email ?? '',
      phone: input?.site?.phone ?? '',
      author: input?.site?.author ?? '',
      copyright: input?.site?.copyright ?? '',
      address: input?.site?.address ?? '',
    },

    common: {
      isMaintenanceMode:
        input?.common?.isMaintenanceMode ?? false,
      maintenanceMessage:
        input?.common?.maintenanceMessage ?? '',
      defaultTheme:
        input?.common?.defaultTheme ?? 'light',
      defaultColor:
        input?.common?.defaultColor ?? 'default',
    },

    carousels: Array.isArray(input?.carousels)
      ? input!.carousels.map((b: HomeBanner) => ({
          id: b?.id,
          title: b?.title ?? '',
          subtitle: b?.subtitle ?? '',
          description: b?.description ?? '',
          image_path: b?.image_path ?? '',
          active: b?.active ?? true,
          position: b?.position ?? 0,
        }))
      : [],

    availableLanguages: Array.isArray(
      input?.availableLanguages
    )
      ? input!.availableLanguages.map((l) => ({
          code: l?.code ?? '',
          name: l?.name ?? '',
        }))
      : [],

    defaultLanguage: input?.defaultLanguage ?? 'fr',

    // 🔥 NOUVEAU CHAMP
    newsletterVideo: input?.newsletterVideo ?? '',
  }
}
