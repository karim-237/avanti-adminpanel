'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import OverviewReport from './overview-report'

export default function OverviewClient() {
  const { data: session, status } = useSession()

  // ⚡ Log pour debug
  useEffect(() => {
    console.log('Session in OverviewClient:', session)
  }, [session])

  if (status === 'loading') return null // on attend la session

  // ⚡ Vérification du rôle
  if (!session || session.user.role !== 'ADMIN') {
    console.warn('User not authorized, redirecting...')
    redirect('/fr/sign-in')
  }

  return <OverviewReport />
}
