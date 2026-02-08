'use client'

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
import { formatDateTime } from '@/lib/utils'
import { getAllNewsletterEmails, deleteNewsletterEmail } from '@/lib/actions/newsletter.actions'

type NewsletterEmail = {
  id: number
  email: string
  created_at: Date
}

type NewsletterListDataProps = {
  emails: NewsletterEmail[]
  totalPages: number
  totalEmails: number
  from: number
  to: number
}

const NewsletterList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<NewsletterListDataProps>()
  const [isPending, startTransition] = useTransition()

  const loadData = (params?: { page?: number; query?: string }) => {
    startTransition(async () => {
      const res = await getAllNewsletterEmails({
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
    ;(window as any).debounce = setTimeout(() => {
      setPage(1)
      loadData({ page: 1, query: value })
    }, 500)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex-between flex-wrap gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-bold text-lg">Liste des Emails</h1>

          <Input
            className="w-auto"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Filtrer par email..."
          />

          {isPending ? (
            <p>Chargement...</p>
          ) : (
            <p>
              {data?.totalEmails === 0
                ? 'Aucun résultat'
                : `${data?.from}-${data?.to} sur ${data?.totalEmails} résultats`}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.emails.map((email) => (
            <TableRow key={email.id}>
              <TableCell>{email.id}</TableCell>
              <TableCell>{email.email}</TableCell>
              <TableCell>
                {email.created_at
                  ? formatDateTime(email.created_at).dateTime
                  : '-'}
              </TableCell>
              <TableCell className="flex gap-1">
                <DeleteDialog
                  id={String(email.id)}
                  action={async (idStr: string) =>
                    deleteNewsletterEmail(Number(idStr))
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

export default NewsletterList
