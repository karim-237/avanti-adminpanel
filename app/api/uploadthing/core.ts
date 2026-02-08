import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { auth } from '@/lib/uploadAuth'

const f = createUploadthing()

// FileRouter pour ton app, peut contenir plusieurs FileRoutes
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      // Auth simplifiée : ici on autorise toujours
      const session = await auth()

      if (!session) throw new UploadThingError('Unauthorized')

      // On retourne un userId fictif pour metadata
      return { userId: 'invité' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Code qui s'exécute côté serveur après upload
      console.log('Upload terminé pour :', metadata.userId, file.url)

      // Ce qui sera reçu côté client dans onClientUploadComplete
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
