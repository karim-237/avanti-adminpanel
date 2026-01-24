'use client'

import { getMonthName } from '@/lib/utils'
import React from 'react'

type TableChartProps = {
  labelType: 'month' | 'generic'
  data: {
    label: string
    value: number
  }[]
}

interface ProgressBarProps {
  value: number // Accepts a number between 0 and 100
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const boundedValue = Math.min(100, Math.max(0, value))
  return (
    <div className="relative w-full h-4 overflow-hidden rounded-lg bg-gray-200">
      <div
        className="bg-primary h-full transition-all duration-300 rounded-lg"
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  )
}

export default function TableChart({ labelType = 'month', data = [] }: TableChartProps) {
  if (!data.length) return null

  const max = Math.max(...data.map((item) => item.value))
  const dataWithPercentage = data.map((x) => ({
    ...x,
    label: labelType === 'month' ? getMonthName(x.label) : x.label,
    percentage: Math.round((x.value / max) * 100),
  }))

  return (
    <div className="space-y-3">
      {dataWithPercentage.map(({ label, value, percentage }) => (
        <div
          key={label}
          className="grid grid-cols-[150px_1fr_80px] gap-2 items-center"
        >
          <div className="text-sm">{label}</div>

          <ProgressBar value={percentage} />

          <div className="text-sm text-right">{value}</div>
        </div>
      ))}
    </div>
  )
}
