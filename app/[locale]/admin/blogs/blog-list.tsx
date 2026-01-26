/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import React, { useEffect, useState, useTransition } from 'react'
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
  deleteBlog,
  getAllBlogsForAdmin,
} from '@/lib/actions/blog.actions'

/** ✅ Type aligné BLOG */
type Blog = {
  tags: any
  id: number
  title: string
  slug?: string | null
  category?: string | null
  status?: string | null
  featured?: boolean | null
}

/** ✅ Type retour API */
type BlogListDataProps = {
  blogs: Blog[]
  totalPages: number
  totalBlogs: number
  from: number
  to: number
}

const BlogList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<BlogListDataProps>()
  const [isPending, startTransition] = useTransition()

  const loadData = (params?: { page?: number; query?: string }) => {
    startTransition(async () => {
      const res = await getAllBlogsForAdmin({
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

    clearTimeout((window as any).debounce)
      ; (window as any).debounce = setTimeout(() => {
        setPage(1)
        loadData({ page: 1, query: value })
      }, 500)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex-between flex-wrap gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='font-bold text-lg'>Liste des Blogs</h1>

          <Input
            className='w-auto'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Filtrer par titre...'
          />

          {isPending ? (
            <p>Chargement...</p>
          ) : (
            <p>
              {data?.totalBlogs === 0
                ? 'Aucun résultat'
                : `${data?.from}-${data?.to} sur ${data?.totalBlogs} résultats`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/blogs/categories">
              Liste des catégories
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/admin/blogs/tags">
              Liste des tags
            </Link>
          </Button>

          <Button asChild>
            <Link href="/admin/blogs/create">
              Ajouter un blog
            </Link>
          </Button>
        </div>

      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className='w-[140px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell>{blog.id}</TableCell>

              <TableCell>
                <Link
                  href={`/admin/blogs/${blog.id}`}
                  className='hover:underline'
                >
                  {blog.title}
                </Link>
              </TableCell>

              <TableCell>{(blog as any).categoryName ?? '-'}</TableCell>
              <TableCell>{blog.tags.join(', ') || '-'}</TableCell>

              <TableCell>{blog.status ?? '-'}</TableCell>

              <TableCell>
                {blog.featured ? 'Oui' : 'Non'}
              </TableCell>

              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/blogs/${blog.id}`}>Modifier</Link>
                </Button>

                {/* {blog.slug && (
                  <Button asChild variant='outline' size='sm'>
                    <Link
                      target='_blank'
                      href={`/blog/${encodeURIComponent(blog.slug)}`}
                    >
                      Voir
                    </Link>
                  </Button>
                )} */}

                <DeleteDialog
                  id={String(blog.id)}
                  action={async (idStr: string) =>
                    deleteBlog(Number(idStr))
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
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => handlePageChange('prev')}
            disabled={page <= 1}
            className='w-24'
          >
            <ChevronLeft /> Précédent
          </Button>

          Page {page} sur {data?.totalPages}

          <Button
            variant='outline'
            onClick={() => handlePageChange('next')}
            disabled={page >= (data?.totalPages ?? 0)}
            className='w-24'
          >
            Suivant <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}

export default BlogList
