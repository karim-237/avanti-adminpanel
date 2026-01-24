import { Metadata } from 'next'
import NewsletterList from './newsletter-list'

export const metadata: Metadata = {
  title: 'Admin Emails',
}

export default async function AdminNewsletter() {
  return <NewsletterList />
}
