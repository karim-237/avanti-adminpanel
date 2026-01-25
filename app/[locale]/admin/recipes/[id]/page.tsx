import { notFound } from 'next/navigation'
import { getRecipeById } from '@/lib/actions/recipe.actions'
import Link from 'next/link'
import RecipeForm from '../recipe-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modifier la recette',
}

interface UpdateRecipeProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

const UpdateRecipe = async ({ params }: UpdateRecipeProps) => {
  const { id } = await params // ✅ unwrap de la Promise

  const numericId = Number(id)
  if (Number.isNaN(numericId)) {
    notFound()
  }

  const recipe = await getRecipeById(numericId)
  if (!recipe) notFound()

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/recipes">Recettes</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/recipes/${recipe.id}`}>{recipe.title}</Link>
      </div>

      <div className="my-8">
        <RecipeForm
          type="Mettre à jour"
          recipe={recipe}
          recipeId={recipe.id}
        />
      </div>
    </main>
  )
}

export default UpdateRecipe
