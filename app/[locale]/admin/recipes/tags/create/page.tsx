import TagForm from '../../tag-form'

export const metadata = {
  title: 'Créer un tag | Admin',
}

export default function CreateTagPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Créer un tag</h1>
        <p className="text-sm text-muted-foreground">
          Ajoutez un nouveau tag.
        </p>
      </div>
 
      <TagForm type="Créer"/>
    </div>
  )
}
