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

import { deleteRecipe, getAllRecipesForAdmin } from '@/lib/actions/recipe.actions'
import { formatDateTime } from '@/lib/utils'

/** ✅ Type aligné Prisma / recipe.actions.ts */
type Recipe = {
  id: number
  title: string
  slug: string
  categoryName: string
  category_id?: number | null
  is_active?: boolean | null
  created_at?: Date | null
}

type RecipeListDataProps = {
  recipes: Recipe[]
  totalPages: number
  totalRecipes: number
  from: number
  to: number
}

const RecipeList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<RecipeListDataProps>()
  const [isPending, startTransition] = useTransition()

  const loadData = (params?: { page?: number; query?: string }) => {
    startTransition(async () => {
      const res = await getAllRecipesForAdmin({
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
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex-between flex-wrap gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='font-bold text-lg'>Liste des Recettes</h1>

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
              {data?.totalRecipes === 0
                ? 'Aucun résultat'
                : `${data?.from}-${data?.to} sur ${data?.totalRecipes} résultats`}
            </p>
          )}
        </div>


        <div className="flex flex-wrap items-center gap-2">
           <Button asChild variant="outline">
            <Link href="/admin/recipes/categories">
              Liste des catégories
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/admin/recipes/tags">
              Liste des tags
            </Link>
          </Button>

            <Button asChild>
          <Link href='/admin/recipes/create'>Ajouter une recette</Link>
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
            <TableHead>Actif</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className='w-[120px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{recipe.id}</TableCell>

              <TableCell>
                <Link
                  href={`/admin/recipes/${recipe.id}`}
                  className='hover:underline'
                >
                  {recipe.title}
                </Link>
              </TableCell>

              <TableCell>{recipe.categoryName ?? '-'}</TableCell>

              <TableCell>
                {recipe.is_active ? 'Oui' : 'Non'}
              </TableCell>

              <TableCell>
                {recipe.created_at
                  ? formatDateTime(recipe.created_at).dateTime
                  : '-'}
              </TableCell>

              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/recipes/${recipe.id}`}>Modifier</Link>
                </Button>

                {/* {recipe.slug && (
                  <Button asChild variant='outline' size='sm'>
                    <Link
                      target='_blank'
                      href={`/recipe/${encodeURIComponent(recipe.slug)}`}
                    >
                      Voir
                    </Link>
                  </Button>
                )} */}

                <DeleteDialog
                  id={String(recipe.id)}
                  action={async (idStr: string) =>
                    deleteRecipe(Number(idStr))
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

export default RecipeList
