'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { toSlug } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createRecipe, updateRecipe } from '@/lib/actions/recipe.actions'

function ImagePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const { toast } = useToast()

  return (
    <div className="flex gap-3 flex-wrap items-center">
      {value && (
        <div className="relative">
          <Image
            src={value}
            width={100}
            height={100}
            alt=""
            className="rounded border"
          />

          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {!value && (
        <label className="cursor-pointer border rounded px-3 py-2 text-sm bg-muted hover:bg-muted/70">
          Ajouter une image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const formData = new FormData()
              formData.append('file', file)

              try {
                const res = await fetch('/api/upload/cloudinary', {
                  method: 'POST',
                  body: formData,
                })

                const data = await res.json()

                if (!res.ok) {
                  throw new Error(data.error || 'Upload failed')
                }

                onChange(data.url)
              } catch (err) {
                console.error(err)
                toast({
                  variant: 'destructive',
                  description: "Échec de l'upload de l'image",
                })
              } finally {
                e.target.value = ''
              }
            }}
          />
        </label>
      )}
    </div>
  )
}

interface RecipeFormInput {
  title: string
  slug: string
  short_description?: string
  content: string
  is_active: boolean
  image: string
  status: string
  paragraph_1: string
  paragraph_2: string
  image_url: string
  category_id: string
}

const defaultValues: RecipeFormInput = {
  title: '',
  slug: '',
  short_description: '',
  content: '',
  is_active: true,
  image: '',
  status: '',
  paragraph_1: '',
  paragraph_2: '',
  image_url: '',
  category_id: '',
}

interface RecipeFormProps {
  type: 'Créer' | 'Mettre à jour'
  recipe?: Partial<RecipeFormInput> & {
    id?: number
    category_id?: number | string | null
  }
  recipeId?: number
}

export default function RecipeForm({
  type,
  recipe,
  recipeId,
}: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<RecipeFormInput>({
    defaultValues: recipe
      ? {
          title: recipe.title ?? '',
          slug: recipe.slug ?? '',
          short_description: recipe.short_description ?? '',
          content: recipe.content ?? '',
          category_id: recipe.category_id
            ? String(recipe.category_id)
            : '',
          is_active: recipe.is_active ?? true,
          image: recipe.image ?? '',
          status: recipe.status ?? '',
          paragraph_1: recipe.paragraph_1 ?? '',
          paragraph_2: recipe.paragraph_2 ?? '',
          image_url: recipe.image_url ?? '',
        }
      : defaultValues,
  })

  async function onSubmit(values: RecipeFormInput) {
    let res

    const payloadBase = {
      title: values.title,
      slug: values.slug,
      short_description: values.short_description,
      content: values.content,
      image: values.image || '',
      image_url: values.image_url || '',
      status: values.status || 'draft',
      paragraph_1: values.paragraph_1 || '',
      paragraph_2: values.paragraph_2 || '',
      is_active: values.is_active,
      category_id: values.category_id
        ? Number(values.category_id)
        : undefined,
    }

    if (type === 'Créer') {
      res = await createRecipe(payloadBase)
    } else {
      if (!recipeId) {
        toast({
          variant: 'destructive',
          description: 'Recipe ID missing',
        })
        return
      }

      res = await updateRecipe({
        id: recipeId,
        ...payloadBase,
      })
    }

    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }

    toast({ description: res.message })
    router.push('/admin/recipes')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <Label>Titre</Label>
        <Input {...form.register('title')} placeholder="Titre" />
      </div>

      <div className="space-y-1">
        <Label>Slug</Label>
        <Input
          {...form.register('slug')}
          placeholder="Slug"
          onBlur={() =>
            form.setValue('slug', toSlug(form.getValues('title')))
          }
        />
      </div>

      <div className="space-y-1">
        <Label>Description courte</Label>
        <Textarea
          {...form.register('short_description')}
          placeholder="Description courte"
        />
      </div>

      <div className="space-y-2">
        <Label>Image de miniature</Label>
        <ImagePicker
          value={form.watch('image_url')}
          onChange={(url) => form.setValue('image_url', url)}
        />
      </div>

      <div className="space-y-2">
        <Label>Image principale</Label>
        <ImagePicker
          value={form.watch('image')}
          onChange={(url) => form.setValue('image', url)}
        />
      </div>

      <div className="space-y-1">
        <Label>Paragraphe 1 de la recette</Label>
        <Textarea
          {...form.register('paragraph_1')}
          placeholder="Paragraphe 1"
        />
      </div>

      <div className="space-y-1">
        <Label>Paragraphe 2 de la recette</Label>
        <Textarea
          {...form.register('paragraph_2')}
          placeholder="Paragraphe 2"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.watch('is_active')}
          onCheckedChange={(v) =>
            form.setValue('is_active', Boolean(v))
          }
        />
        <Label>Actif</Label>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? type === 'Créer'
            ? 'Création en cours...'
            : 'Mise à jour en cours...'
          : type === 'Créer'
          ? 'Créer la recette'
          : 'Mettre à jour la recette'}
      </Button>
    </form>
  )
}
