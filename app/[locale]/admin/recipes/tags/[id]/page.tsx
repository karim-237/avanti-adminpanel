import { notFound } from 'next/navigation'
import { getBlogTagById } from '@/lib/actions/blog.actions'
import Link from 'next/link'
import TagForm from '../../tag-form' // import absolu pour éviter les erreurs
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modifier le Tag',
}

type UpdateTagProps = {
  params: Promise<{
    id: string
    locale: string
  }>
}

const UpdateTag = async ({ params }: UpdateTagProps) => {
  const { id } = await params // ✅ unwrap de la Promise

  const numericId = Number(id)
  if (Number.isNaN(numericId)) notFound()

  const tag = await getBlogTagById(numericId)
  if (!tag) notFound()

  return ( 
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex mb-4 gap-2 items-center">
        <Link href={`/admin/recipes/tags`} className="underline">
          Tags
        </Link>
        <span>›</span>
        <Link href={`/admin/recipes/tags/${tag.id}`}>{tag.name}</Link>
      </div>

      <div className="my-8">
        <TagForm type="Mettre à jour" tag={tag} tagId={tag.id} />
      </div>
    </main>
  )
}

export default UpdateTag
