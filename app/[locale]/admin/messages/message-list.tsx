'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
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
  getAllMessagesForAdmin,
  deleteMessage,
} from '@/lib/actions/message.actions'
import { formatDateTime } from '@/lib/utils'

type Message = {
  id: number
  name: string
  email: string
  subject: string
  content: string
  created_at: Date
}

type MessageListDataProps = {
  messages: Message[]
  totalPages: number
  totalMessages: number
  from: number
  to: number
}

const MessageList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<MessageListDataProps | undefined>()
  const [isPending, startTransition] = useTransition()

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const loadData = (params?: { page?: number; query?: string }) => {
    startTransition(async () => {
      const res = await getAllMessagesForAdmin({
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

    if (debounceRef.current) clearTimeout(debounceRef.current)

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
      <div className="flex-between flex-wrap gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-bold text-lg">Messages reçus</h1>
          <Input
            className="w-auto"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Filtrer par nom, email ou sujet..."
          />
          {isPending ? (
            <p>Chargement...</p>
          ) : (
            <p>
              {data?.totalMessages === 0
                ? 'Aucun résultat'
                : `${data?.from}-${data?.to} sur ${data?.totalMessages} messages`}
            </p>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Sujet</TableHead>
            <TableHead>Reçu le</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>{message.id}</TableCell>
              <TableCell>{message.name}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell>{message.subject}</TableCell>
              <TableCell>{formatDateTime(message.created_at).dateTime}</TableCell>
              <TableCell className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/messages/${message.id}`}>Lire</Link>
                </Button>
                <DeleteDialog
                  id={String(message.id)}
                  action={async (idStr: string) => deleteMessage(Number(idStr))}
                  callbackAction={loadData}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

export default MessageList
