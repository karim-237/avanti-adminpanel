'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/use-user-store'

export default function UserButton() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const clearUser = useUserStore((s) => s.clearUser)

  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger className='header-button' asChild>
          <div className='flex items-center'>
            <div className='flex flex-col text-xs text-left'>
              <span>
                Bonjour, {user ? user.name : 'Invité'}
              </span>
              <span className='font-bold'>Compte</span>
            </div>
            <ChevronDownIcon />
          </div>
        </DropdownMenuTrigger>

        {user ? (
          <DropdownMenuContent className='w-56' align='end'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium'>{user.name}</p>
                <p className='text-xs text-muted-foreground'>{user.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup>
              {user.role === 'ADMIN' && (
                <Link href='/admin/overview'>
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>

            <DropdownMenuItem
              onClick={() => {
                clearUser()               // 🔥 vraie déconnexion
                router.push('/sign-in')   // 🔁 redirection
              }}
              className='text-red-600'
            >
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className='w-56' align='end'>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className={cn(buttonVariants(), 'w-full')}
                  href='/sign-in'
                >
                  Se connecter
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  )
}
