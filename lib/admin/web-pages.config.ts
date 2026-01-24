// lib/admin/web-pages.config.ts
export const ADMIN_WEB_PAGES = {
  'a-propos-de-nous': {
    title: 'A propos de nous',
  },
  services: {
    title: 'Services',
  },
  contact: {
    title: 'Contact',
  },
  'conditions-generales-utilisation': {
    title: "Conditions générales d'utilisation",
  },
  'mentions-legales': {
    title: 'Mentions légales',
  },
} as const

export type AdminWebPageSlug = keyof typeof ADMIN_WEB_PAGES
