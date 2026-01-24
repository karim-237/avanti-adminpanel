'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  deleteProduct,
  getAllProductsForAdmin,
} from '@/lib/actions/product.actions'
import { formatDateTime } from '@/lib/utils'

/** ✅ Type aligné Prisma */
type Product = {
  id: number
  name?: string | null
  slug?: string | null
  category?: string | null
  active?: boolean | null
  created_at?: Date | null
}

type ProductListDataProps = {
  products: Product[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps | undefined>()
  const [isPending, startTransition] = useTransition()

  // ✅ debounce proprement typé
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadData = (params?: { page?: number; query?: string }) => {
    startTransition(async () => {
      const res = await getAllProductsForAdmin({
        page: params?.page ?? page,
        query: params?.query ?? inputValue,
      })
      setData(res)
    })
  }

  const handlePageChange = (type: 'next' | 'prev') => {
    const newPage = type === 'next' ? page + 1 : page - 1
    setPage(newPage)
    loadData({ page: newPage })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadData({ page: 1, query: value })
    }, 500)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex-between flex-wrap gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-bold text-lg">Liste des Produits</h1>

          <Input
            className="w-auto"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Filtrer par nom..."
          />

          {isPending ? (
            <p>Chargement...</p>
          ) : (
            <p>
              {data?.totalProducts === 0
                ? 'Aucun resultat'
                : `${data?.from}-${data?.to} sur ${data?.totalProducts} resultats`}
            </p>
          )}
        </div>

        <Button asChild>
          <Link href="/admin/products/create">Ajouter un produit</Link>
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom du produit</TableHead>
            <TableHead>Catégorie du produit</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>

              <TableCell>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="hover:underline"
                >
                  {product.name}
                </Link>
              </TableCell>

              <TableCell>{product.category ?? '-'}</TableCell>

              <TableCell>{product.active ? 'Oui' : 'Non'}</TableCell>

              <TableCell>
                {product.created_at
                  ? formatDateTime(product.created_at).dateTime
                  : '-'}
              </TableCell>

              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/products/${product.id}`}>Modifier</Link>
                </Button>

                <DeleteDialog
                  id={String(product.id)}
                  action={async (idStr: string) =>
                    deleteProduct(Number(idStr))
                  }
                  callbackAction={loadData}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange('prev')}
            disabled={page <= 1}
            className="w-24"
          >
            <ChevronLeft /> Précédent
          </Button>

          Page {page} sur {data?.totalPages}

          <Button
            variant="outline"
            onClick={() => handlePageChange('next')}
            disabled={page >= (data?.totalPages ?? 0)}
            className="w-24"
          >
            Suivant <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProductList
