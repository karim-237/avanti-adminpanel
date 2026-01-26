'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createBlogCategory } from '@/lib/actions/blog.actions'
import { toSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type CategoryFormInput = {
  name: string
  slug: string
}

export default function CategoryForm() {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<CategoryFormInput>({
    defaultValues: { name: '', slug: '' },
  })

  async function onSubmit(values: CategoryFormInput) {
    const res = await createBlogCategory(values)

    if (!res?.success) {
      toast({ variant: 'destructive', description: res?.message })
      return
    }

    toast({ description: res.message })
    router.refresh()
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nom de la catégorie</Label>
        <Input {...form.register('name')} />
      </div>

      <div className="space-y-1">
        <Label>Slug</Label>
        <Input
          {...form.register('slug')}
          onBlur={() =>
            form.setValue('slug', toSlug(form.getValues('name')))
          }
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Créer la catégorie
        </Button>


        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>

    </form>
  )
}
