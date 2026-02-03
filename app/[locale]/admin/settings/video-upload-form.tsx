'use client'

import { UseFormReturn, Path } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'

// ✅ Déclaration explicite des valeurs du formulaire
type VideoUploadFormProps<T extends { newsletterVideo?: string }> = {
  id?: string
  form: UseFormReturn<T>
}

export default function VideoUploadForm<
  T extends { newsletterVideo?: string }
>({ id, form }: VideoUploadFormProps<T>) {


  const [uploading, setUploading] = useState(false)

  // ✅ Plus d'erreur TS
  const videoUrl = form.watch('newsletterVideo' as Path<T>)


  async function handleUpload(file: File) {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'upload")
      }

      // ✅ Type-safe
      form.setValue('newsletterVideo' as Path<T>, data.url as any)

      toast({
        description: 'Vidéo uploadée avec succès',
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        description: "Échec de l'upload de la vidéo",
      })
    } finally {
      setUploading(false)
    }
  }

  function removeVideo() {
    form.setValue('newsletterVideo' as Path<T>, '' as any)
  }


  return (
    <div id={id} className="space-y-4 border rounded p-4">
      <h2 className="text-lg font-semibold">Section Vidéo</h2>

      <div className="space-y-3">
        {videoUrl ? (
          <div className="space-y-3">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-[300px] bg-black rounded"
            />

            <Button
              type="button"
              variant="destructive"
              onClick={removeVideo}
            >
              Supprimer la vidéo
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer flex items-center justify-center w-full h-40 bg-gray-100 hover:bg-gray-200 rounded border">
            {uploading ? "Upload en cours..." : "Ajouter une vidéo"}

            <input
              type="file"
              accept="video/*"
              hidden
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)

                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}
