'use client'
import { useState, useTransition } from 'react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function DeleteDialog({
  id,
  action,
  callbackAction,
}: {
  id: string
  action: (id: string) => Promise<{ success: boolean; message: string }>
  callbackAction?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='outline'>
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous vraiment sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>

          <Button
            variant='destructive'
            size='sm'
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await action(id)
                if (!res.success) {
                  toast({
                    variant: 'destructive',
                    description: res.message,
                  })
                } else {
                  setOpen(false)
                  toast({
                    description: res.message,
                  })
                  if (callbackAction) callbackAction()
                }
              })
            }
          >
            {isPending ? 'Suppresion en cours...' : 'Supprimer'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
