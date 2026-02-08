import { Metadata } from 'next'
import Link from 'next/link'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'Se connecter',
}

export default async function SignInPage(props: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  const callbackUrl = searchParams.callbackUrl ?? '/'
  const { site } = await getSetting()

  return (
    <div className='w-full'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>Tableau de Bord</CardTitle>
        </CardHeader>
        <CardContent>
          <CredentialsSignInForm />
        </CardContent>
      </Card>

     
    </div>
  )
}
