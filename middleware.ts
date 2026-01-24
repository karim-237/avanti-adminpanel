import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(fr|en-US|fr-FR)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
