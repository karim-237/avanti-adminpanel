'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateSiteContactInfo } from '@/lib/actions/site-contact-info.actions'

type ContactFormInput = {
  address_text?: string
  address_url?: string
  map_url?: string
  phone_numbers: string
  emails: string
}

export default function ContactPageForm({ data }: { data: any }) {
  const { toast } = useToast()

  const form = useForm<ContactFormInput>({
    defaultValues: {
      address_text: data?.address_text ?? '',
      address_url: data?.address_url ?? '',
      map_url: data?.map_url ?? '',
      phone_numbers: (data?.phone_numbers || []).join(', '),
      emails: (data?.emails || []).join(', '),
    },
  })

  async function onSubmit(values: ContactFormInput) {
    const payload = {
      address_text: values.address_text,
      address_url: values.address_url,
      map_url: values.map_url,
      phone_numbers: values.phone_numbers
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      emails: values.emails
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    }

    const res = await updateSiteContactInfo(payload)

    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }

    toast({ description: 'Contact mis à jour' })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label>Adresse</Label>
        <Input {...form.register('address_text')} />
      </div>

      <div>
        <Label>URL de l’adresse</Label>
        <Input {...form.register('address_url')} />
      </div>

      <div>
        <Label>Carte Google (URL)</Label>
        <Input {...form.register('map_url')} />
      </div>

      <div>
        <Label>Numéros (séparés par virgule)</Label>
        <Input {...form.register('phone_numbers')} />
      </div>

      <div>
        <Label>Emails (séparés par virgule)</Label>
        <Input {...form.register('emails')} />
      </div>

      <Button type="submit">Mettre à jour</Button>
    </form>
  )
}
