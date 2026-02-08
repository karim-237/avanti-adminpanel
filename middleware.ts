import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

import NextAuth from 'next-auth'
import authConfig from './auth.config'

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
  // Récupérer la locale depuis l'URL ou utiliser la valeur par défaut
  const locale = req.nextUrl.pathname.split('/')[1] || routing.defaultLocale;
  
  const newUrl = new URL(
    `/${locale}/sign-in?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`,
    req.nextUrl.origin
  )
  return Response.redirect(newUrl)
}


  return intlMiddleware(req)
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
