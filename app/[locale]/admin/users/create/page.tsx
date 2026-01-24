import Link from 'next/link'
import { Metadata } from 'next'
import UserForm from '../user-form'

export const metadata: Metadata = {
  title: 'Créer un utilisateur',
}

const CreateUserPage = () => {
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/users">Utilisateurs</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/users/create">Créer un utilisateur</Link>
      </div>

      <div className="my-8">
        <UserForm type="Créer" />
      </div>
    </main>
  )
}

export default CreateUserPage
