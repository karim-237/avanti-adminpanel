// lib/actions/admin-pages.actions.ts
import { prisma } from '@/lib/db/prisma'

export async function getAboutSection() {
  return prisma.about_section.findFirst()
}

export async function getServicesPageData() {
  const [section, benefits] = await Promise.all([
    prisma.choose_section.findFirst(),
    prisma.choose_benefits.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
    }),
  ])

  return { section, benefits }
}


export async function getContactInfo() {
  return prisma.site_contact_info.findFirst()
}
