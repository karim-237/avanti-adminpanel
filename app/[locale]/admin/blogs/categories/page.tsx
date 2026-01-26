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
  deleteBlogCategory,
  getAllBlogCategoriesAdmin,
} from '@/lib/actions/blog.actions'

type Category = {
  id: number
  name: string
  slug: string
}

const CategoryList = () => {
  const [data, setData] = useState<Category[]>([])
  const [isPending, startTransition] = useTransition()

  const loadData = () => {
    startTransition(async () => {
      const res = await getAllBlogCategoriesAdmin()
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
        <h1 className="font-bold text-lg">Catégories du blog</h1>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/blogs/categories/create">
              Ajouter une catégorie
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/admin/blogs">
              ← Retour aux blogs
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
                <DeleteDialog
                  id={String(cat.id)}
                  action={async (idStr: string) =>
                    deleteBlogCategory(Number(idStr))
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
