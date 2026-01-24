'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ❌ icon simple
function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
    >
      ✕
    </button>
  )
}

type ProductFormInput = {
  name: string
  slug: string
  description?: string
  category?: string
  active: boolean
  images: string[]
}

const defaultValues: ProductFormInput = {
  name: '',
  slug: '',
  description: '',
  category: '',
  active: true,
  images: [],
}

export default function ProductForm({
  type,
  product,
  productId,
}: {
  type: 'Créer' | 'Mettre à jour'
  product?: any
  productId?: number
}) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProductFormInput>({
    defaultValues: product
      ? {
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        category: product.category ?? '',
        active: product.active ?? true,
        images: [
          product.image_path,
          product.image_2,
          product.image_3,
          product.image_4,
        ].filter(Boolean),
      }
      : defaultValues,
  })

  const images = form.watch('images')

  async function onSubmit(values: ProductFormInput) {
    let res

    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      category: values.category,
      image_path: values.images[0] || '',
      image_2: values.images[1] || '',
      image_3: values.images[2] || '',
      image_4: values.images[3] || '',
      active: values.active,
      additional_info: '',
    }

    if (type === 'Créer') {
      res = await createProduct(payload)
    } else {
      if (!productId) {
        toast({ variant: 'destructive', description: 'Product ID missing' })
        return
      }

      res = await updateProduct({ id: productId, ...payload })
    }

    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }

    toast({ description: res.message })
    router.push('/admin/products')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <Label>Nom du produit</Label>
        <Input {...form.register('name')} placeholder="Nom du produit" />
      </div>

      <div className="space-y-1">
        <Label>Slug</Label>
        <Input
          {...form.register('slug')}
          placeholder="Slug"
          onBlur={() =>
            form.setValue('slug', toSlug(form.getValues('name')))
          }
        />
      </div>

      <div className="space-y-1">
        <Label>Catégorie</Label>
        <Input {...form.register('category')} placeholder="Catégorie" />
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea {...form.register('description')} placeholder="Description" />
      </div>

      <div className="space-y-2">
        <Label>Images du produit</Label>

        <div className="flex gap-3 items-center flex-wrap">
          {images.map((img, index) => (
            <div key={`${img}-${index}`} className="relative">
              <Image
                src={img}
                width={80}
                height={80}
                alt=""
                className="rounded border"
              />

              <RemoveButton
                onClick={() => {
                  const next = images.filter((_, i) => i !== index)
                  form.setValue('images', next)
                }}
              />
            </div>
          ))}

          {images.length < 4 && (
            <label className="cursor-pointer border rounded px-3 py-2 text-sm bg-muted hover:bg-muted/70">
              Ajouter une image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  if (images.length >= 4) {
                    toast({
                      variant: 'destructive',
                      description: 'Maximum 4 images par produit',
                    })
                    return
                  }

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

                    form.setValue('images', [...images, data.url])
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
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.watch('active')}
          onCheckedChange={(v) => form.setValue('active', Boolean(v))}
        />
        <Label>Actif</Label>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? type === 'Créer'
            ? 'Création en cours...'
            : 'Mise à jour en cours...'
          : type === 'Créer'
            ? 'Créer le produit'
            : 'Mettre à jour le produit'}
      </Button>
    </form>
  )
}
