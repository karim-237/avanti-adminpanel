import Link from 'next/link'
import RecipeForm from '../recipe-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer une recette',
}

const CreateProductPage = () => {
  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/recipes'>Recettes</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/recipes/create'>Créer une recette</Link>
      </div>

      <div className='my-8'>
        <RecipeForm type='Créer' />
      </div>
    </main>
  )
}

export default CreateProductPage
