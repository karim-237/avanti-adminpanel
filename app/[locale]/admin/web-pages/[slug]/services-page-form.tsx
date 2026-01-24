'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

import { updateChooseSection } from '@/lib/actions/choose-section.actions'
import { updateChooseBenefit } from '@/lib/actions/choose-benefits.actions'

export default function ServicesPageForm({ data }: { data: any }) {
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    /* ===============================
       1️⃣ UPDATE SECTION PRINCIPALE
    =============================== */
    const sectionRes = await updateChooseSection({
      subtitle: String(formData.get('subtitle') || ''),
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      active: true,
    })

    if (!sectionRes.success) {
      toast({ variant: 'destructive', description: sectionRes.message })
      return
    }

    /* ===============================
       2️⃣ UPDATE BENEFITS
    =============================== */
    for (let i = 0; i < data.benefits.length; i++) {
      const benefit = data.benefits[i]

      const res = await updateChooseBenefit({
        id: benefit.id,
        title: String(formData.get(`benefit_title_${i}`) || ''),
        description: String(formData.get(`benefit_desc_${i}`) || ''),
        position: i + 1,
        active: true,
      })

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: `Erreur sur le bénéfice ${i + 1}`,
        })
        return
      }
    }

    toast({ description: 'Page Services mise à jour avec succès' })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* ===============================
          SECTION
      =============================== */}
      <div>
        <Label>Sous-titre</Label>
        <Input
          name="subtitle"
          defaultValue={data.section?.subtitle ?? ''}
        />
      </div>

      <div>
        <Label>Titre</Label>
        <Input
          name="title"
          defaultValue={data.section?.title ?? ''}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="description"
          defaultValue={data.section?.description ?? ''}
        />
      </div>

      {/* ===============================
          BENEFITS
      =============================== */}
      <div className="space-y-4">
        <h3 className="font-semibold">Bénéfices</h3>

        {data.benefits.map((b: any, i: number) => (
          <div
            key={b.id}
            className="border p-4 rounded space-y-2"
          >
            <div>
              <Label>Titre</Label>
              <Input
                name={`benefit_title_${i}`}
                defaultValue={b.title ?? ''}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name={`benefit_desc_${i}`}
                defaultValue={b.description ?? ''}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit">Mettre à jour</Button>
    </form>
  )
}
