import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function RootPage() {
  // Charge automatiquement la locale par défaut (ex: fr)
  redirect(`/${routing.defaultLocale}`)
}
