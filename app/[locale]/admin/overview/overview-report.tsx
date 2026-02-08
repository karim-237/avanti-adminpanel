import { Activity, BadgeDollarSign, Barcode, BookOpen, CreditCard, Package, Users, Clipboard as ClipboardIcon, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { calculatePastDate, formatNumber } from '@/lib/utils'

import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { TodayDateDisplay } from './date-range-picker'

import { countProducts } from '@/lib/actions/product.actions'
import { countBlogs } from '@/lib/actions/blog.actions'
import { countRecipes } from '@/lib/actions/recipe.actions'
import { countNewsletterEmails } from '@/lib/actions/newsletter.actions' // <-- Import ajouté

export default function OverviewReport() {
  const t = useTranslations('Admin')
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>()

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchData() {
      const [productsCount, blogsCount, recipesCount, newsletterCount] =
        await Promise.all([
          countProducts(),
          countBlogs(),
          countRecipes(),
          countNewsletterEmails(), // <-- Ajouté
        ])

      setData({
        totalSales: newsletterCount, // <-- On met le compteur des emails ici
        ordersCount: blogsCount,
        usersCount: recipesCount,
        productsCount,
        salesChartData: [],
        monthlySales: [],
        topSalesProducts: [],
        topSalesCategories: [],
        latestOrders: [],
      })
    }

    fetchData()
  }, [])

  if (!data)
    return (
      <div className="space-y-4">
        <div>
          <h1 className="h1-bold">Tableau de bord</h1>
        </div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      </div>
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="h1-bold">{t('Dashboard')}</h1>
        <TodayDateDisplay />
      </div>


      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Card Newsletter */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Newsletter Subscribers')}</CardTitle>
              <Mail />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {formatNumber(data.totalSales)}
              </div>
              <div>
                <Link className="text-xs" href="/admin/newsletters">
                  {t('View subscribers')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card Blogs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Number of blogs')}</CardTitle>
              <BookOpen />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatNumber(data.ordersCount)}</div>
              <div>
                <Link className="text-xs" href="/admin/blogs">
                  {t('View blogs')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card Recipes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Number of recipes')}</CardTitle>
              <ClipboardIcon />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatNumber(data.usersCount)}</div>
              <div>
                <Link className="text-xs" href="/admin/recipes">
                  {t('View recipes')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Number of products')}</CardTitle>
              <Package />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatNumber(data.productsCount)}</div>
              <div>
                <Link className="text-xs" href="/admin/products">
                  {t('View products')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
