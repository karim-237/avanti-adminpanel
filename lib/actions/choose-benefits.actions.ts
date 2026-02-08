'use server'

import { prisma } from '@/lib/db/prisma'

export async function getAllChooseBenefits() {
  try {
    return await prisma.choose_benefits.findMany({
      orderBy: { position: 'asc' },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createChooseBenefit(data: {
  title?: string
  description?: string
  position?: number
  active?: boolean
}) {
  try {
    await prisma.choose_benefits.create({ data })
    return { success: true, message: 'Avantage ajouté' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur lors de la création' }
  }
}

export async function updateChooseBenefit(data: {
  id: number
  title?: string
  description?: string
  position?: number
  active?: boolean
}) {
  try {
    await prisma.choose_benefits.update({
      where: { id: data.id },
      data,
    })
    return { success: true, message: 'Avantage mis à jour' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur de mise à jour' }
  }
}

export async function deleteChooseBenefit(id: number) {
  try {
    await prisma.choose_benefits.delete({ where: { id } })
    return { success: true, message: 'Avantage supprimé' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'Erreur de suppression' }
  }
}
