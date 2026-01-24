import { Metadata } from 'next'
import BlogList from './blog-list'

export const metadata: Metadata = {
  title: 'Admin Blogs',
}

export default async function AdminBlog() {
  return <BlogList />
}
