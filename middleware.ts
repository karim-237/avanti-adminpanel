import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { NextResponse } from 'next/server'

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
]

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // ✅ 1. Redirection explicite de / vers /fr (ou defaultLocale)
  if (pathname === '/') {
    const defaultLocale = routing.defaultLocale
    const url = req.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const isPublicPage = publicPathnameRegex.test(pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  }

  if (!req.auth) {
    const newUrl = new URL(
      `/sign-in?callbackUrl=${
        encodeURIComponent(req.nextUrl.pathname) || '/'
      }`,
      req.nextUrl.origin
    )
    return NextResponse.redirect(newUrl)
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
