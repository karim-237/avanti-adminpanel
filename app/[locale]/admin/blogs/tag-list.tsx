'use client'

import React, { useEffect, useState, useTransition } from 'react'
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
import { deleteBlogTag, getAllBlogTagsAdmin } from '@/lib/actions/blog.actions'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Tag = {
  id: number
  name: string
  slug: string
}

const TagList = () => {
  const [data, setData] = useState<Tag[]>([])
  const [isPending, startTransition] = useTransition()
  const params = useParams()
  const locale = params.locale // récupère le locale actuel

  const loadData = () => {
    startTransition(async () => {
      const res = await getAllBlogTagsAdmin()
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
        <h1 className="font-bold text-lg">Tags du blog</h1>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/${locale}/admin/blogs/tags/create`}>Ajouter un tag</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/${locale}/admin/blogs`}>← Retour aux blogs</Link>
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
            <TableHead className="w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.id}</TableCell>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.slug}</TableCell>
              <TableCell className="flex gap-1">
                {/* Bouton Modifier */}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${locale}/admin/blogs/tags/${tag.id}`}>Modifier</Link>
                </Button>

                {/* Bouton Supprimer */}
                <DeleteDialog
                  id={String(tag.id)}
                  action={async (idStr: string) =>
                    deleteBlogTag(Number(idStr))
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

export default TagList
