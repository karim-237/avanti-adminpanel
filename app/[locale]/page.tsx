import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params   // ✅ UNWRAP

  const safeLocale = routing.locales.includes(locale as any)
    ? locale
    : routing.defaultLocale

  redirect(`/${safeLocale}/sign-in`)
}
