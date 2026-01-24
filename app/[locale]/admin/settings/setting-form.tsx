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
import { useHomeBanners } from '@/hooks/use-home-banners'
import { useEffect, useMemo } from 'react'
import { normalizeSetting } from '@/lib/normalize-setting'

const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  const { setSetting } = useSetting()
  const { toast } = useToast()
  const { homeBanners, loading } = useHomeBanners()

  // ✅ Normalisation UNE SEULE FOIS
  const normalizedSetting = useMemo(
    () => normalizeSetting(setting),
    [setting]
  )

  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema),
    defaultValues: normalizedSetting,
    shouldUnregister: false, // 🔒 empêche RHF de drop des champs
  })

  // ✅ Injecte les bannières API proprement
  useEffect(() => {
    if (!loading) {
      const merged = normalizeSetting({
        ...normalizedSetting,
        carousels:
          homeBanners.length > 0
            ? homeBanners
            : normalizedSetting.carousels,
      })

      form.reset(merged)
    }
  }, [loading, homeBanners, form, normalizedSetting])

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(values: ISettingInput) {
    const cleanValues = normalizeSetting(values)

    const res = await updateSetting(cleanValues)

    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
    } else {
      toast({ description: res.message })
      setSetting(cleanValues as ClientSetting)
      form.reset(cleanValues) // 🔒 garde la cohérence UI
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SiteInfoForm id="setting-site-info" form={form} />
        <CommonForm id="setting-common" form={form} />

        {!loading && (
          <CarouselForm
            defaultBanners={homeBanners}
            form={form}
          />
        )}

        <LanguageForm id="setting-languages" form={form} />

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full mb-24"
          >
            {isSubmitting
              ? 'Enregistrement des modifications...'
              : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingForm
