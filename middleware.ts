import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

import NextAuth from 'next-auth'
import authConfig from './auth.config'

const publicPages = [
  '/',
  '/fr',
  '/en',
  '/es',
  '/sign-in',
  '/(fr|en|es)/sign-in',
  '/search',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
]

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  }

  if (!req.auth) {
    const pathname = req.nextUrl.pathname
    const firstSegment = pathname.split('/')[1]

    const locale = routing.locales.includes(firstSegment)
      ? firstSegment
      : routing.defaultLocale

    const newUrl = new URL(
      `/${locale}/sign-in?callbackUrl=${encodeURIComponent(pathname)}`,
      req.nextUrl.origin
    )

    return Response.redirect(newUrl)
  }

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/',
    '/(fr|en|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
