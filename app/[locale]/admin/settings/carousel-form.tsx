'use client'

import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { useRef } from 'react'
import { HomeBanner } from '@/hooks/use-home-banners'

type CarouselFormProps<T extends { carousels?: HomeBanner[] }> = {
  defaultBanners?: HomeBanner[]
  id?: string
  form?: UseFormReturn<T>
}

function RemoveImageButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        absolute 
        top-2.5 right-2 
        bg-red-600 text-white 
        rounded-full w-6 h-6 
        flex items-center justify-center 
        text-sm hover:bg-red-700 
        z-20
      "
    >
      ✕
    </button>
  )
}

export default function CarouselForm<T extends { carousels?: HomeBanner[] }>({
  defaultBanners,
  id,
  form,
}: CarouselFormProps<T>) {
  // 🔒 defaultValues figées UNE FOIS POUR TOUTES
  const defaultValuesRef = useRef<{ carousels: HomeBanner[] }>({
    carousels: Array.from({ length: 4 }, (_, i) => defaultBanners?.[i] ?? {
      image_path: '',
      title: '',
      subtitle: '',
      description: '',
      active: true,
    }),
  })

  const internalForm = useForm<{ carousels: HomeBanner[] }>({
    defaultValues: defaultValuesRef.current,
  })

  const activeForm =
    (form as UseFormReturn<{ carousels: HomeBanner[] }> | undefined) ||
    internalForm

  const { fields, update } = useFieldArray({
    control: activeForm.control,
    name: 'carousels',
  })

  const banners = activeForm.getValues('carousels')

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    form ? (
      <>{children}</>
    ) : (
      <form
        id={id}
        onSubmit={activeForm.handleSubmit(() => {})}
        className="space-y-4"
      >
        {children}
      </form>
    )

  return (
    <Wrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border rounded p-4 relative flex flex-col space-y-2"
          >
            {/* Image */}
            <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
              {banners[index]?.image_path ? (
                <>
                  <Image
                    src={banners[index].image_path}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <RemoveImageButton
                    onClick={() =>
                      update(index, {
                        ...banners[index],
                        image_path: '',
                      })
                    }
                  />
                </>
              ) : (
                <label className="cursor-pointer flex items-center justify-center w-full h-full bg-gray-200 hover:bg-gray-300 rounded">
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
                        if (!res.ok)
                          throw new Error(data.error || 'Upload failed')

                        update(index, {
                          ...banners[index],
                          image_path: data.url,
                        })
                      } catch (err) {
                        console.error(err)
                        toast({
                          variant: 'destructive',
                          description:
                            "Échec de l'upload de l'image",
                        })
                      } finally {
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Inputs texte */}
            <div className="flex flex-col space-y-2">
              <Label>Titre</Label>
              <Input
                {...activeForm.register(`carousels.${index}.title`)}
                placeholder="Titre"
              />

              <Label>Description</Label>
              <Input
                {...activeForm.register(
                  `carousels.${index}.description`
                )}
                placeholder="Description"
              />
            </div>
          </div>
        ))}
      </div>

      {!form && (
        <Button
          type="submit"
          disabled={activeForm.formState.isSubmitting}
          className="mt-2 w-full"
        >
          {activeForm.formState.isSubmitting
            ? 'Sauvegarde en cours...'
            : 'Sauvegarder les bannières'}
        </Button>
      )}
    </Wrapper>
  )
}
