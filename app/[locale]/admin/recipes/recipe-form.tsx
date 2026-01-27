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

function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { toast } = useToast()

  return (
    <div className="flex gap-3 flex-wrap items-center">
      {value && (
        <div className="relative">
          <Image src={value} width={100} height={100} alt="" className="rounded border" />
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
                const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: formData })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                onChange(data.url)
              } catch (err) {
                console.error(err)
                toast({ variant: 'destructive', description: "Échec de l'upload de l'image" })
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
  category_id?: number
  tag_ids: number[]
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
  category_id: undefined,
  tag_ids: [],
}

interface RecipeFormProps {
  type: 'Créer' | 'Mettre à jour'
  categories: { id: number; name: string }[]
  tags: { id: number; name: string }[]
  recipe?: Partial<RecipeFormInput> & { id?: number; category_id?: number | null; tag_ids?: number[] | { id: number }[] }
  recipeId?: number
}

export default function RecipeForm({ type, recipe, recipeId, categories, tags }: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Convert tag_ids en array de nombres si ce sont des objets
  const initialTagIds = recipe?.tag_ids?.map((t: any) => (typeof t === 'number' ? t : t.id)) ?? []

  const form = useForm<RecipeFormInput>({
    defaultValues: recipe
      ? { ...defaultValues, ...recipe, category_id: recipe.category_id ?? undefined, tag_ids: initialTagIds }
      : defaultValues,
  })

  async function onSubmit(values: RecipeFormInput) {
    const payload = { ...values, status: values.status || 'draft', category_id: values.category_id ?? undefined }

    let res
    if (type === 'Créer') {
      res = await createRecipe(payload)
    } else {
      if (!recipeId) {
        toast({ variant: 'destructive', description: 'Recipe ID missing' })
        return
      }
      res = await updateRecipe({ id: recipeId, ...payload })
    }

    if (!res?.success) {
      toast({ variant: 'destructive', description: res?.message || 'Erreur' })
      return
    }

    toast({ description: res.message })
    router.push('/admin/recipes')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Titre */}
      <div className="space-y-1">
        <Label>Titre</Label>
        <Input {...form.register('title')} placeholder="Titre" />
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <Label>Slug</Label>
        <Input
          {...form.register('slug')}
          placeholder="Slug"
          onBlur={() => form.setValue('slug', toSlug(form.getValues('title')))}
        />
      </div>

      {/* Catégorie */}
      <div className="space-y-1">
        <Label>Catégorie</Label>
        <select {...form.register('category_id', { valueAsNumber: true })} className="w-full border rounded px-3 py-2 text-sm">
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <select
          multiple
          {...form.register('tag_ids')}
          className="w-full min-h-[120px] border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Chips des tags */}
        {form.watch('tag_ids')?.length ? (
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((t) => form.watch('tag_ids')?.includes(t.id))
              .map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
                >
                  {t.name}
                  <button
                    type="button"
                    onClick={() => {
                      const current = form.getValues('tag_ids') ?? []
                      form.setValue('tag_ids', current.filter((id) => id !== t.id))
                    }}
                    className="ml-2 text-primary/60 hover:text-primary"
                  >
                    ✕
                  </button>
                </span>
              ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Astuce : maintiens Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs tags
          </p>
        )}
      </div>

      {/* Description courte */}
      <div className="space-y-1">
        <Label>Description courte</Label>
        <Textarea {...form.register('short_description')} placeholder="Description courte" />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Image de miniature</Label>
        <ImagePicker value={form.watch('image_url')} onChange={(url) => form.setValue('image_url', url)} />
      </div>
      <div className="space-y-2">
        <Label>Image principale</Label>
        <ImagePicker value={form.watch('image')} onChange={(url) => form.setValue('image', url)} />
      </div>

      {/* Paragraphes */}
      <div className="space-y-1">
        <Label>Paragraphe 1 de la recette</Label>
        <Textarea {...form.register('paragraph_1')} placeholder="Paragraphe 1" />
      </div>
      <div className="space-y-1">
        <Label>Paragraphe 2 de la recette</Label>
        <Textarea {...form.register('paragraph_2')} placeholder="Paragraphe 2" />
      </div>

      {/* Actif */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.watch('is_active')}
          onCheckedChange={(v) => form.setValue('is_active', Boolean(v))}
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
