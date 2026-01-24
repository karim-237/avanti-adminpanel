'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function TodayDateDisplay({ className }: { className?: string }) {
  const today = new Date()

  // Format : Jour de la semaine le jour mois année
  const formattedDate = format(today, "EEEE 'le' d MMMM yyyy", { locale: fr })

  // Exemple : "Lundi le 24 janvier 2026"

  return (
    <div className={cn('grid gap-2', className)}>
      <Button
        variant="outline"
        className="justify-start text-left font-normal cursor-default"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
      </Button>
    </div>
  )
}
