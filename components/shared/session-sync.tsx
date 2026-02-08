'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/use-user-store'

export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    if (session?.user) {
      setUser({
        ...session.user,
        role: session.user.role as 'ADMIN' | 'USER', // ✅ cast vers le type attendu
      })
    }
  }, [session, setUser])

  return <>{children}</>
}
