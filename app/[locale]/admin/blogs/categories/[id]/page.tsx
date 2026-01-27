import { notFound } from 'next/navigation'
import { getBlogCategoryById } from '@/lib/actions/blog.actions'
import Link from 'next/link'
import CategoryForm from '../../category-form' // import absolu pour éviter les erreurs
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modifier le Tag',
}

type UpdateCategoryProps = {
  params: Promise<{
    id: string
    locale: string
  }>
}

const UpdateCategory = async ({ params }: UpdateCategoryProps) => {
  const { id } = await params // ✅ unwrap de la Promise

  const numericId = Number(id)
  if (Number.isNaN(numericId)) notFound()

  const category = await getBlogCategoryById(numericId)
  if (!category) notFound()

  return ( 
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex mb-4 gap-2 items-center">
        <Link href={`/admin/blogs/categories`} className="underline">
          Catégories
        </Link>
        <span>›</span>
        <Link href={`/admin/blogs/categories/${category.id}`}>{category.name}</Link>
      </div>

      <div className="my-8">
        <CategoryForm type="Mettre à jour" category={category} categoryId={category.id} />
      </div>
    </main>
  )
}

export default UpdateCategory
