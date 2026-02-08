import React, { useEffect } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import { ClientSetting } from '@/types'

interface AppInitializerProps {
  setting: ClientSetting
  children: React.ReactNode
}

export default function AppInitializer({
  setting,
  children,
}: AppInitializerProps) {
  // Met à jour le store dès que setting change
  useEffect(() => {
    useSettingStore.setState({ setting })
  }, [setting])

  return <>{children}</>
}
