import { notFound } from 'next/navigation'
import Link from 'next/link'

import { ADMIN_WEB_PAGES, AdminWebPageSlug } from '@/lib/admin/web-pages.config'
import {
  getAboutSection,
  getServicesPageData,
  getContactInfo,
} from '@/lib/actions/admin-pages.actions'

import AboutPageForm from './about-page-form'
import ServicesPageForm from './services-page-form'
import ContactPageForm from './contact-page-form'

type PageProps = {
  params: {
    slug: string
  }
}

export default async function AdminWebPage({ params }: PageProps) {
  const slug = params.slug as AdminWebPageSlug

  if (!ADMIN_WEB_PAGES[slug]) notFound()

  let content = null
  let FormComponent = null

  switch (slug) {
    case 'a-propos-de-nous':
      content = await getAboutSection()
      FormComponent = AboutPageForm
      break

    case 'services':
      content = await getServicesPageData()
      FormComponent = ServicesPageForm
      break

    case 'contact':
      content = await getContactInfo()
      FormComponent = ContactPageForm
      break

    default:
      notFound()
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="mb-4 text-sm">
        <Link href="/admin/web-pages">Pages Web</Link> › {ADMIN_WEB_PAGES[slug].title}
      </div>

      <FormComponent data={content} />
    </main>
  )
}
