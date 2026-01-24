'use client'

import { useState, useEffect } from 'react'
import { getNoCachedSetting } from '@/lib/actions/setting.actions'

export type HomeBanner = {
  id?: number
  title?: string
  subtitle?: string
  description?: string
  image_path: string
  position?: number
  active?: boolean
}

export function useHomeBanners() {
  const [homeBanners, setHomeBanners] = useState<HomeBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      try {
        // Récupère le setting complet depuis la DB
        const setting = await getNoCachedSetting()
        // On récupère uniquement les carousels / bannières
        setHomeBanners(setting.carousels || [])
      } catch (err) {
        console.error('Erreur lors de la récupération des bannières :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  return { homeBanners, loading }
}
