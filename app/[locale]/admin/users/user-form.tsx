'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { registerUser, updateUser } from '@/lib/actions/user.actions'

type UserFormInput = {
    name: string
    email: string
    password?: string
    confirmPassword?: string
    role: 'USER' | 'ADMIN'
}

const defaultValues: UserFormInput = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
}

export default function UserForm({
    type,
    user,
}: {
    type: 'Créer' | 'Mettre à jour'
    user?: any
}) {
    const router = useRouter()
    const { toast } = useToast()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<UserFormInput>({
        defaultValues: user
            ? {
                  name: user.name ?? '',
                  email: user.email ?? '',
                  role: user.role ?? 'USER',
              }
            : defaultValues,
    })

    async function onSubmit(values: UserFormInput) {
        let res

        if (type === 'Créer') {
            res = await registerUser({
                name: values.name,
                email: values.email,
                password: values.password!,
                confirmPassword: values.confirmPassword!,
            })
        } else {
            res = await updateUser({
                _id: user.id,
                name: values.name,
                email: values.email,
                role: values.role,
            })
        }

        if (!res.success) {
            const errorMessage =
                'message' in res
                    ? res.message
                    : 'error' in res
                    ? res.error
                    : 'Une erreur est survenue'

            toast({
                variant: 'destructive',
                description: errorMessage,
            })
            return
        }

        toast({ description: res.message })
        router.push('/admin/users')
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">

            {/* NAME */}
            <div className="space-y-1">
                <Label>Nom</Label>
                <Input {...form.register('name')} placeholder="Nom" />
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
                <Label>Email</Label>
                <Input {...form.register('email')} placeholder="Email" type="email" />
            </div>

            {/* PASSWORDS (Create only) */}
            {type === 'Créer' && (
                <>
                    <div className="space-y-1 relative">
                        <Label>Mot de passe</Label>
                        <Input
                            {...form.register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mot de passe"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-[64%] -translate-y-1/2 text-muted-foreground"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="space-y-1 relative">
                        <Label>Confirmer le mot de passe</Label>
                        <Input
                            {...form.register('confirmPassword')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirmer le mot de passe"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-[64%] -translate-y-1/2 text-muted-foreground"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </>
            )}

            {/* ROLE */}
            <div className="space-y-1">
                <Label>Rôle</Label>
                <Select
                    value={form.watch('role')}
                    onValueChange={(value) =>
                        form.setValue('role', value as 'USER' | 'ADMIN')
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit">
                {type === 'Créer' ? 'Créer l’utilisateur' : 'Mettre à jour'}
            </Button>
        </form>
    )
}
