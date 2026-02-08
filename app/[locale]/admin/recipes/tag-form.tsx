'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createRecipeTag, updateRecipeTag } from '@/lib/actions/recipe.actions'
import { toSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type TagFormInput = {
  name: string
  slug: string
}

export default function TagForm({
  type,
  tag,
  tagId,
}: {
  type: 'Créer' | 'Mettre à jour'
  tag?: { name: string; slug: string }
  tagId?: number
}) {
  const { toast } = useToast()
  const router = useRouter()

  // ✅ Source de vérité réelle
  const isCreateMode = !tagId

  const form = useForm<TagFormInput>({
    defaultValues: tag
      ? { name: tag.name, slug: tag.slug }
      : { name: '', slug: '' },
  })

  async function onSubmit(values: TagFormInput) {
    let res

    if (isCreateMode) {
      // create
      res = await createRecipeTag(values)
    } else {
      if (!tagId) {
        toast({ variant: 'destructive', description: 'Tag ID manquant' })
        return
      }

      // update
      res = await updateRecipeTag({ id: tagId, ...values })
    }

    if (!res?.success) {
      toast({ variant: 'destructive', description: res?.message })
      return
    }

    toast({ description: res.message })

    // ✅ Redirection vers la liste des tags après succès
    router.push(`/admin/recipes/tags`)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Nom du tag</Label>
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

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? isCreateMode
            ? 'Création en cours...'
            : 'Mise à jour en cours...'
          : isCreateMode
          ? 'Créer le tag'
          : 'Mettre à jour le tag'}
      </Button>
    </form>
  )
}
