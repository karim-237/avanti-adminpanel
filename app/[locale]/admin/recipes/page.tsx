import { Metadata } from 'next'
import RecipeList from './recipe-list'

export const metadata: Metadata = {
  title: 'Admin Recipe',
}

export default async function AdminRecipe() {
  return <RecipeList />
}
