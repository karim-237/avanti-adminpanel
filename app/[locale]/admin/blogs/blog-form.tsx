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
}: {
  type: 'Créer' | 'Mettre à jour'
  blog?: any
  blogId?: number
}) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<BlogFormInput>({
    defaultValues: blog
      ? {
        title: blog.title ?? '',
        slug: blog.slug ?? '',
        category: blog.category ?? 'All',
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
        <Input {...form.register('category')} placeholder="Catégorie" />
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
