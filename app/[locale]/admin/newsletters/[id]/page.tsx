import { notFound } from 'next/navigation'
import { getAllNewsletterEmails } from '@/lib/actions/newsletter.actions'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détail de l’Email Newsletter',
}

type NewsletterDetailProps = {
  params: {
    id: string
  }
}

const NewsletterDetail = async ({ params }: NewsletterDetailProps) => {
  const { id } = params
  // Récupérer l'email par id
  const data = await getAllNewsletterEmails({ page: 1, limit: 1 })
  const email = data.emails.find((e: { id: number }) => e.id === Number(id))

  if (!email) notFound()

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/newsletters">Newsletters</Link>
        <span className="mx-1">›</span>
        <span>{email.email}</span>
      </div>

      <div className="my-8 p-4 border rounded-md shadow-sm">
        <h1 className="text-xl font-bold mb-2">Détail de l’email</h1>
        <p>
          <strong>ID :</strong> {email.id}
        </p>
        <p>
          <strong>Email :</strong> {email.email}
        </p>
        <p>
          <strong>Date d’inscription :</strong>{' '}
          {email.created_at ? new Date(email.created_at).toLocaleString() : '-'}
        </p>
      </div>
    </main>
  )
}

export default NewsletterDetail
