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
  deleteBlogTag,
  getAllBlogTagsAdmin,
} from '@/lib/actions/blog.actions'

type Tag = {
  id: number
  name: string
  slug: string
}

const TagList = () => {
  const [data, setData] = useState<Tag[]>([])
  const [isPending, startTransition] = useTransition()

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
            <Link href="/admin/blogs/tags/create">
              Ajouter un tag
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
          {data.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.id}</TableCell>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.slug}</TableCell>
              <TableCell className="flex gap-1">
                {/* plus tard : modifier */}
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
