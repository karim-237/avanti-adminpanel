import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'products',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
