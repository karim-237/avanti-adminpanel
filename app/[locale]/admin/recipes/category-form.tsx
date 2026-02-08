'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  createRecipeCategory,
  updateRecipeCategory,
} from '@/lib/actions/recipe.actions'
import { toSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type CategoryFormInput = {
  name: string
  slug: string
}

export default function CategoryForm({
  type,
  category,
  categoryId,
}: {
  type: 'Créer' | 'Mettre à jour'
  category?: { name: string; slug: string }
  categoryId?: number
}) {
  const { toast } = useToast()
  const router = useRouter()

  // ✅ Source de vérité réelle
  const isCreateMode = !categoryId

  const form = useForm<CategoryFormInput>({
    defaultValues: category
      ? { name: category.name, slug: category.slug }
      : { name: '', slug: '' },
  })

  async function onSubmit(values: CategoryFormInput) {
    let res

    if (isCreateMode) {
      // create
      res = await createRecipeCategory(values)
    } else {
      if (!categoryId) {
        toast({ variant: 'destructive', description: 'Category ID manquant' })
        return
      }

      // update
      res = await updateRecipeCategory({
        id: categoryId,
        ...values,
      })
    }

    if (!res?.success) {
      toast({ variant: 'destructive', description: res?.message })
      return
    }

    toast({ description: res.message })
    router.push(`/admin/recipes/categories`)
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

      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isCreateMode
              ? 'Création en cours...'
              : 'Mise à jour en cours...'
            : isCreateMode
            ? 'Créer la catégorie'
            : 'Mettre à jour la catégorie'}
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
