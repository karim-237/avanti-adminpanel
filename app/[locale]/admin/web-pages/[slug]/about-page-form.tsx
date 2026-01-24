'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { UploadButton } from '@/lib/uploadthing'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { updateAboutSection } from '@/lib/actions/about-section.actions'

type AboutFormInput = {
    small_title?: string
    main_title?: string
    description?: string
    video_url?: string

    experience_years?: number
    experience_text?: string

    satisfaction_percent?: number
    satisfaction_text?: string

    products_sold?: string
    products_text?: string

    images: string[]
}

export default function AboutPageForm({ data }: { data: any }) {
    const { toast } = useToast()

    const form = useForm<AboutFormInput>({
        defaultValues: {
            small_title: data?.small_title ?? '',
            main_title: data?.main_title ?? '',
            description: data?.description ?? '',
            video_url: data?.video_url ?? '',
            experience_years: data?.experience_years ?? 0,
            experience_text: data?.experience_text ?? '',
            satisfaction_percent: data?.satisfaction_percent ?? 0,
            satisfaction_text: data?.satisfaction_text ?? '',
            products_sold: data?.products_sold ?? '',
            products_text: data?.products_text ?? '',
            images: [
                data?.left_image,
                data?.right_image,
                data?.main_image,
                data?.secondary_image,
            ].filter(Boolean),
        },
    })

    const images = form.watch('images')

    async function onSubmit(values: AboutFormInput) {
        const payload = {
            small_title: values.small_title,
            main_title: values.main_title,
            description: values.description,
            video_url: values.video_url,

            experience_years: Number(values.experience_years),
            experience_text: values.experience_text,

            satisfaction_percent: Number(values.satisfaction_percent),
            satisfaction_text: values.satisfaction_text,

            products_sold: values.products_sold,
            products_text: values.products_text,

            left_image: values.images[0] || undefined,
            right_image: values.images[1] || undefined,
            main_image: values.images[2] || undefined,
            secondary_image: values.images[3] || undefined,
        }

        const res = await updateAboutSection(payload)

        if (!res.success) {
            toast({ variant: 'destructive', description: res.message })
            return
        }

        toast({ description: 'Page "À propos" mise à jour' })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label>Petit titre</Label>
                <Input {...form.register('small_title')} />
            </div>

            <div>
                <Label>Titre principal</Label>
                <Input {...form.register('main_title')} />
            </div>

            <div>
                <Label>Description</Label>
                <Textarea {...form.register('description')} />
            </div>

            <div>
                <Label>Vidéo (URL)</Label>
                <Input {...form.register('video_url')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Années d’expérience</Label>
                    <Input type="number" {...form.register('experience_years')} />
                </div>
                <div>
                    <Label>Texte expérience</Label>
                    <Input {...form.register('experience_text')} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Satisfaction (%)</Label>
                    <Input type="number" {...form.register('satisfaction_percent')} />
                </div>
                <div>
                    <Label>Texte satisfaction</Label>
                    <Input {...form.register('satisfaction_text')} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Produits vendus</Label>
                    <Input {...form.register('products_sold')} />
                </div>
                <div>
                    <Label>Texte produits</Label>
                    <Input {...form.register('products_text')} />
                </div>
            </div>

            <div>
                <Label>Images</Label>
                <div className="flex gap-2 items-center flex-wrap">
                    {images.map((img, i) => (
                        <Image key={i} src={img} width={80} height={80} alt="" />
                    ))}
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) =>
                            form.setValue('images', [...images, res[0].url])
                        }
                    />
                </div>
            </div>

            <Button type="submit">Mettre à jour</Button>
        </form>
    )
}
