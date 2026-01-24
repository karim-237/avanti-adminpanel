import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { locale: string } }) {
  const { locale } = params

  // Redirige directement vers la page de connexion pour ce locale
  redirect(`/${locale}/sign-in`)
}
