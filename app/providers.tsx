'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/use-user-store'

export default function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    const stored = sessionStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [setUser])

  return <>{children}</>
}
