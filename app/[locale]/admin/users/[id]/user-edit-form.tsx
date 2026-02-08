'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { updateUser } from '@/lib/actions/user.actions'
import { UserUpdateSchema } from '@/lib/validator'

interface UserEditFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Mapping pour labels clairs
const ROLE_LABELS: Record<string, string> = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
}

const UserEditForm = ({ user }: UserEditFormProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // mot de passe optionnel
    },
  })

  const onSubmit = async (values: z.infer<typeof UserUpdateSchema>) => {
    try {
      const res = await updateUser(values)

      if (!res.success) {
        return toast({ variant: 'destructive', description: res.message })
      }

      toast({ description: res.message })
      form.reset()
      router.push(`/admin/users`)
    } catch (error: any) {
      toast({ variant: 'destructive', description: error.message })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* NAME & EMAIL */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez un email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ROLE */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-1 w-full max-w-md">
              <FormLabel>Rôle</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PASSWORD (OPTIONAL) */}
        <div className="space-y-1 relative max-w-md">
          <FormLabel>Mot de passe (laisser vide pour ne pas modifier)</FormLabel>
          <FormControl>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nouveau mot de passe"
              {...form.register('password')}
            />
          </FormControl>
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-[65%] -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <FormMessage />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Mise à jour...' : "Mettre à jour l'utilisateur"}
          </Button>
          <Button 
            variant="outline"
            type="button"
            onClick={() => router.push(`/admin/users`)}
          >
            Retour
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default UserEditForm
