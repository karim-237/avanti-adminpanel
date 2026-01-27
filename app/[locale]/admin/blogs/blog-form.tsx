'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createBlog, updateBlog } from '@/lib/actions/blog.actions'
import { toSlug } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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

/* ---------------------------------- TYPES --------------------------------- */

type BlogFormInput = {
  title: string
  slug: string
  category_id?: number
  tag_ids?: number[]
  category?: string
  short_description: string
  full_content?: string

  featured: boolean
  status: string

  image_url: string

  paragraph_1: string
  paragraph_2: string
  author_bio: string

  single_image: string
  single_image_xl: string
  image_secondary: string

  quote: string
}

/* ------------------------------ DEFAULT VALUES ----------------------------- */

const defaultValues: BlogFormInput = {
  title: '',
  slug: '',
  category: '',
  tag_ids: [],
  short_description: '',
  full_content: '',

  featured: false,
  status: '',

  image_url: '',

  paragraph_1: '',
  paragraph_2: '',
  author_bio: '',

  single_image: '',
  single_image_xl: '',
  image_secondary: '',

  quote: '',
}

export default function BlogForm({
  type,
  blog,
  blogId,
  categories,
  tags,
}: { 
  type: 'Créer' | 'Mettre à jour'
  blog?: any
  blogId?: number
  categories: { id: number; name: string }[]
  tags: { id: number; name: string }[]
}) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<BlogFormInput>({
    defaultValues: blog
      ? {
          title: blog.title ?? '',
          slug: blog.slug ?? '',
          category_id: blog.category_id ?? undefined, // ✅ pré-remplit la catégorie
          tag_ids: blog.blogs_post_tags?.map((bt: any) => bt.tag_id) ?? [], // ✅ pré-remplit les tags
          short_description: blog.short_description ?? '',
          full_content: blog.full_content ?? '',

          featured: blog.featured ?? false,
          status: blog.status ?? 'published',

          image_url: blog.image_url ?? '',

          paragraph_1: blog.paragraph_1 ?? '',
          paragraph_2: blog.paragraph_2 ?? '',
          author_bio: blog.author_bio ?? 'Nous vous tenons informés grâce à nos articles.',

          single_image: blog.single_image ?? '',
          single_image_xl: blog.single_image_xl ?? '',
          image_secondary: blog.image_secondary ?? '',

          quote: blog.quote ?? '',
        }
      : defaultValues,
  })

  async function onSubmit(values: BlogFormInput) {
    let res

    if (type === 'Créer') {
      res = await createBlog(values)
    } else {
      if (!blogId) {
        toast({ variant: 'destructive', description: 'Blog ID manquant' })
        return
      }

      res = await updateBlog({
        id: blogId,
        ...values,
      })
    }

    if (!res?.success) {
      toast({
        variant: 'destructive',
        description: res?.message || 'Une erreur est survenue',
      })
      return
    }

    toast({ description: res.message })
    router.push('/admin/blogs')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <Label>Titre du blog</Label>
        <Input {...form.register('title')} placeholder="Titre du blog" />
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
        <Label>Catégorie</Label>
        <select
          {...form.register('category_id', { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>

        <select
          multiple
          className="
      w-full
      min-h-[120px]
      border
      rounded-md
      px-3
      py-2
      text-sm
      bg-background
      focus:outline-none
      focus:ring-2
      focus:ring-primary
      focus:border-primary
    "
          value={(form.watch('tag_ids') ?? []).map(String)}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions).map((o) =>
              Number(o.value)
            )
            form.setValue('tag_ids', values)
          }}
        >
          {tags.map((t) => (
            <option key={t.id} value={t.id} className="py-1">
              {t.name}
            </option>
          ))}
        </select>

        {/* Chips des tags sélectionnés */}
        {form.watch('tag_ids')?.length ? (
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((t) => form.watch('tag_ids')?.includes(t.id))
              .map((t) => (
                <span
                  key={t.id}
                  className="
              inline-flex
              items-center
              rounded-full
              bg-primary/10
              text-primary
              px-3
              py-1
              text-xs
              font-medium
            "
                >
                  {t.name}
                  <button
                    type="button"
                    onClick={() => {
                      const current = form.getValues('tag_ids') ?? []
                      form.setValue(
                        'tag_ids',
                        current.filter((id) => id !== t.id)
                      )
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

      <div className="space-y-1">
        <Label>Description courte</Label>
        <Textarea
          {...form.register('short_description')}
          placeholder="Description courte"
        />
      </div>

      <div className="space-y-2">
        <Label>Image principale</Label>
        <ImagePicker
          value={form.watch('image_url')}
          onChange={(url) => form.setValue('image_url', url)}
        />
      </div>

      <div className="space-y-1">
        <Label>Paragraphe 1</Label>
        <Textarea {...form.register('paragraph_1')} placeholder="Paragraphe 1" />
      </div>

      <div className="space-y-1">
        <Label>Paragraphe 2</Label>
        <Textarea {...form.register('paragraph_2')} placeholder="Paragraphe 2" />
      </div>

      <div className="space-y-1">
        <Label>Bio de l’auteur</Label>
        <Textarea {...form.register('author_bio')} placeholder="Bio de l'auteur" />
      </div>

      <div className="space-y-1">
        <Label>Citation</Label>
        <Textarea {...form.register('quote')} placeholder="Citation" />
      </div>

      <div className="space-y-2">
        <Label>Image large</Label>
        <ImagePicker
        
          value={form.watch('single_image_xl')}
          onChange={(url) => form.setValue('single_image_xl', url)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.watch('featured')}
          onCheckedChange={(v) => form.setValue('featured', Boolean(v))}
        />
        <Label>Blog en vedette</Label>
      </div>

      <div className="space-y-1">
        <Label>Statut</Label>
        <Input
          {...form.register('status')}
          placeholder="published"
        />
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? type === 'Créer'
            ? 'Création en cours...'
            : 'Mise à jour en cours...'
          : type === 'Créer'
          ? 'Créer le blog'
          : 'Mettre à jour le blog'}
      </Button>
    </form>
  )
}
