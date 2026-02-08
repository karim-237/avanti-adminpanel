import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import Image from 'next/image'
import { toast } from '@/hooks/use-toast'

interface ChooseBenefit {
  title: string
  description: string
}

interface AboutChooseFormProps {
  form: UseFormReturn<any>
  id: string
}

export default function AboutChooseForm({ form, id }: AboutChooseFormProps) {
  const { control, watch, setValue } = form

  const about = watch('about') || {
  main_title: '',
  description: '',
  left_image: '',
  right_image: '',
}

const choose = watch('choose') || {
  title: '',
  description: '',
  why_us: '',
}

  const chooseBenefits: ChooseBenefit[] =
  watch('chooseBenefits') || [
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ]


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
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
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setValue(path, data.url)
    } catch (err) {
      console.error(err)
      toast({ variant: 'destructive', description: "Échec de l'upload de l'image" })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>Section à propos et pourquoi nous</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* About Section */}
        <FormField
          control={control}
          name="about.main_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre principal</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Titre principal" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="about.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['left_image', 'right_image'].map((side) => (
            <div key={side}>
              <FormLabel>{side === 'left_image' ? 'Image gauche' : 'Image droite'}</FormLabel>
              <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                {about[side] ? (
                  <>
                    <Image src={about[side]} alt={side} fill className="object-cover" unoptimized />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setValue(`about.${side}`, '')}
                      className="absolute top-2 right-2"
                    >
                      Supprimer
                    </Button>
                  </>
                ) : (
                  <label className="cursor-pointer flex items-center justify-center w-full h-full bg-gray-200 hover:bg-gray-300 rounded">
                    Ajouter une image
                    <input type="file" accept="image/*" hidden onChange={(e) => handleUpload(e, `about.${side}`)} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pourquoi nous */}
        <FormField
          control={control}
          name="choose.why_us"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pourquoi nous ?</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Paragraphe Pourquoi nous" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Services */}
        {chooseBenefits.map((service, index) => (
          <div key={index} className="space-y-2 border p-3 rounded">
            <h4 className="font-medium">{`Service ${index + 1}`}</h4>

            <FormField
              control={control}
              name={`chooseBenefits.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du service</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`Titre Service ${index + 1}`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`chooseBenefits.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du service</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={`Description Service ${index + 1}`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
