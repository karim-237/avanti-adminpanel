'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { SettingInputSchema } from '@/lib/validator'
import { ClientSetting, ISettingInput } from '@/types'
import { updateSetting } from '@/lib/actions/setting.actions'
import useSetting from '@/hooks/use-setting-store'
import LanguageForm from './language-form'
import SiteInfoForm from './site-info-form'
import CommonForm from './common-form'
import CarouselForm from './carousel-form'
import AboutChooseForm from './about-choose-form'
import VideoUploadForm from './video-upload-form'
import { useHomeBanners } from '@/hooks/use-home-banners'
import { useEffect, useMemo, useState } from 'react'
import { normalizeSetting } from '@/lib/normalize-setting'
import { AboutChooseData } from '@/types/types'
import { getAboutChooseSection, updateAboutChooseSection } from '@/lib/actions/about-section.actions'


const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  const { setSetting } = useSetting()
  const { toast } = useToast()
  const { homeBanners, loading } = useHomeBanners()
  const [aboutChooseData, setAboutChooseData] = useState<AboutChooseData | null>(null)

  // Normalisation initiale du setting classique
  const normalizedSetting = useMemo(() => normalizeSetting(setting), [setting])

  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema),
    defaultValues: normalizedSetting,
    shouldUnregister: false,
  })

  // 🔹 Charger la section About + ChooseBenefits depuis la DB
  useEffect(() => {
    async function loadAboutChoose() {
      const data: AboutChooseData = await getAboutChooseSection()
      setAboutChooseData(data)

      form.reset({
        ...normalizedSetting,
        about: {
          main_title: data?.about?.main_title || '',
          description: data?.about?.description || '',
          left_image: data?.about?.left_image || '',
          right_image: data?.about?.right_image || '',
        },
        choose: {
          title: data?.choose?.title || '',
          description: data?.choose?.description || '',
          why_us: data?.choose?.why_us || '',
        },
        chooseBenefits: data?.chooseBenefits?.length
          ? data.chooseBenefits
          : [
            { title: '', description: '' },
            { title: '', description: '' },
            { title: '', description: '' },
          ],
      })

    }
    loadAboutChoose()
  }, [form, normalizedSetting])

  // Injecte les bannières API proprement
  useEffect(() => {
    if (!loading) {
      const merged = normalizeSetting({
        ...normalizedSetting,
        carousels: homeBanners.length > 0 ? homeBanners : normalizedSetting.carousels,
      })
      form.reset(merged)
    }
  }, [loading, homeBanners, form, normalizedSetting])

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(values: ISettingInput) {
    const cleanValues = normalizeSetting(values)

    try {
      // Mettre à jour About + ChooseBenefits
      await updateAboutChooseSection({
        about: cleanValues.about ?? {
          main_title: '',
          description: '',
          left_image: '',
          right_image: '',
        },
        chooseBenefits: cleanValues.chooseBenefits ?? [
          { title: '', description: '' },
          { title: '', description: '' },
          { title: '', description: '' },
        ],
      })


      // Mettre à jour le reste du setting
      const res = await updateSetting(cleanValues)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        setSetting(cleanValues as ClientSetting)
        form.reset(cleanValues)
      }
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', description: 'Erreur lors de la mise à jour de la section À propos' })
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" method="post" onSubmit={form.handleSubmit(onSubmit)}>
        <SiteInfoForm id="setting-site-info" form={form} />
        <CommonForm id="setting-common" form={form} />
        <AboutChooseForm id="setting-about-choose" form={form} />

        {!loading && (
          <>
            <CarouselForm defaultBanners={homeBanners} form={form} />
            <VideoUploadForm id="setting-newsletter-video" form={form} />
          </>
        )}

        <LanguageForm id="setting-languages" form={form} />

        <div>
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full mb-24">
            {isSubmitting ? 'Enregistrement des modifications...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingForm
