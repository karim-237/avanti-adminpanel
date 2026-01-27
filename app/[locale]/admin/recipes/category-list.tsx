'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DeleteDialog from '@/components/shared/delete-dialog'
import {
  deleteRecipeCategory,
  getAllRecipeCategories,
} from '@/lib/actions/recipe.actions'
import { useParams } from 'next/navigation'

type Category = {
  id: number
  name: string
  slug: string
}

const CategoryList = () => {
  const [data, setData] = useState<Category[]>([])
  const [isPending, startTransition] = useTransition()
   const params = useParams()
    const locale = params.locale // récupère le locale actuel

  const loadData = () => {
    startTransition(async () => {
      const res = await getAllRecipeCategories()
      setData(res)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex-between flex-wrap gap-2">
        <h1 className="font-bold text-lg">Catégories de recette</h1>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/recipes/categories/create">
              Ajouter une catégorie
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/admin/recipes">
              ← Retour aux Recettes
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.id}</TableCell>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.slug}</TableCell>
              <TableCell className="flex gap-1">
                {/* plus tard : modifier */}

                  {/* Bouton Modifier */}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${locale}/admin/blogs/categories/${cat.id}`}>Modifier</Link>
                </Button>
                <DeleteDialog
                  id={String(cat.id)}
                  action={async (idStr: string) =>
                    deleteRecipeCategory(Number(idStr))
                  }
                  callbackAction={loadData}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isPending && <p>Chargement...</p>}
    </div>
  )
}

export default CategoryList
