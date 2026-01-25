import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function Page({ params }: { params: { locale?: string } }) {
  const locale = routing.locales.includes(params?.locale as string)
    ? params!.locale!
    : routing.defaultLocale

  redirect(`/${locale}/sign-in`)
}
