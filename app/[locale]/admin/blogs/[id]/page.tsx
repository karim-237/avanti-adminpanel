import { notFound } from 'next/navigation'
import { getBlogById } from '@/lib/actions/blog.actions'
import Link from 'next/link'
import BlogForm from '../blog-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modifier le Blog',
}

type UpdateBlogProps = {
  params: {
    id: string 
  }
}

const UpdateBlog = async ({ params }: UpdateBlogProps) => {
  const { id } = params
  const blog = await getBlogById(Number(id)) // id en number pour Prisma
  if (!blog) notFound()

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/blogs">Blogs</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/blogs/${blog.id}`}>{blog.title}</Link>
      </div>

      <div className="my-8">
        <BlogForm type="Mettre à jour" blog={blog} blogId={blog.id} />
      </div>
    </main>
  )
}

export default UpdateBlog
