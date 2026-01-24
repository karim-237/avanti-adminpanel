import { create } from 'zustand'

type User = {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

type UserStore = {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  clearUser: () => {
    sessionStorage.removeItem('user')
    set({ user: null })
  },
}))
