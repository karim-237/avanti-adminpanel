// Pas de 'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata = {
  title: 'Admin Pages Web',
}

const webPages = [
  { title: 'A propos de nous', slug: 'a-propos-de-nous', isActive: true },
  { title: 'Mentions Légales', slug: 'mentions-legales', isActive: true },
  { title: "Condition générale d'utilisation", slug: 'conditions-generales-utilisation', isActive: true },
  { title: 'Services', slug: 'services', isActive: true },
  { title: 'Contact', slug: 'contact', isActive: true },
]

export default function WebPageAdminPage() {
  return (
    <div className="space-y-2">
      <h1 className="h1-bold">Pages Web</h1>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom de la page</TableHead>
              <TableHead>Slug de la page</TableHead>
              <TableHead>Page active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webPages.map((page) => (
              <TableRow key={page.slug}>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>{page.isActive ? 'Oui' : 'Non'}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/web-pages/${page.slug}`}>Mofifier</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
