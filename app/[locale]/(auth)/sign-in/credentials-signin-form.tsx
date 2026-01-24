'use client'

import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import useSettingStore from '@/hooks/use-setting-store'
import { toast } from '@/hooks/use-toast'
import { UserSignInSchema } from '@/lib/validator'
import { IUserSignIn } from '@/types'
import { useUserStore } from '@/store/use-user-store'

const signInDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        email: 'admin@example.com',
        password: '123456',
      }
    : {
        email: '',
        password: '',
      }

export default function CredentialsSignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl =
    searchParams.get('callbackUrl') ||
    `/${searchParams.get('locale') || 'fr'}/admin/overview`

  const {
    setting: { site },
  } = useSettingStore()

  const setUser = useUserStore((s) => s.setUser)

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  const onSubmit = async (data: IUserSignIn) => {
    try {
      await signIn('credentials', {
        redirect: true,
        email: data.email,
        password: data.password,
        callbackUrl,
      })

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue ${data.email}`,
      })

      setUser({
        id: '0',
        email: data.email,
        name: data.email.split('@')[0],
        role: 'ADMIN',
      })
    } catch (_err) {
      toast({
        title: 'Erreur',
        description: 'Email ou mot de passe invalide',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Entrer votre email d&apos;accès" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Entrer votre mot de passe d&apos;accès"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full'>
            Se connecter
          </Button>

          <p className='text-sm text-muted-foreground'>
            Accédez au panel d&apos;administration de {site.name} via vos identifiants internes.
          </p>
        </div>
      </form>
    </Form>
  )
}
