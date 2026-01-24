import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/actions/product.actions'
import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modifier le Produit',
}

type UpdateProductProps = {
  params: {
    id: string
  }
}

const UpdateProduct = async ({ params }: UpdateProductProps) => {
  const { id } = params
  const product = await getProductById(Number(id)) // id en number pour Prisma
  if (!product) notFound()

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/products">Produits</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/products/${product.id}`}>{product.name}</Link>
      </div>

      <div className="my-8">
        <ProductForm type="Mettre à jour" product={product} productId={product.id} />
      </div>
    </main>
  )
}

export default UpdateProduct
