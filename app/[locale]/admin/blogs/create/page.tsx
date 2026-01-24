import Link from 'next/link'
import BlogForm from '../blog-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ajouter un blog',
}

const CreateBlogPage = () => {
  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/blogs'>Blogs</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/blogs/create'>Ajouter un blog</Link>
      </div>

      <div className='my-8'>
        <BlogForm type='Créer' />
      </div>
    </main>
  )
}

export default CreateBlogPage
