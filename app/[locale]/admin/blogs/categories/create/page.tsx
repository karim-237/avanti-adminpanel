import CategoryForm from '../../category-form'

export const metadata = {
  title: 'Créer une catégorie | Admin',
}

export default function CreateCategoryPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Créer une catégorie</h1>
        <p className="text-sm text-muted-foreground">
          Ajoutez une nouvelle catégorie pour les articles du blog.
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
