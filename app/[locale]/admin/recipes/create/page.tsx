import Link from 'next/link'
import RecipeForm from '../recipe-form'
import { Metadata } from 'next'
import { getAllRecipeCategories, getAllRecipeTags } from '@/lib/actions/recipe.actions'

export const metadata: Metadata = {
  title: 'Créer une recette',
}

const CreateRecipePage = async () => {
  // ✅ récupérer les données depuis le serveur
  const categories = await getAllRecipeCategories()
  const tags = await getAllRecipeTags()

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/recipes">Recettes</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/recipes/create">Créer une recette</Link>
      </div>

      <div className="my-8">
        <RecipeForm type="Créer" categories={categories} tags={tags} />
      </div>
    </main>
  )
}

export default CreateRecipePage
