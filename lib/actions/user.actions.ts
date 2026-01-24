'use server'

import bcrypt from 'bcryptjs'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { UserSignUpSchema, UserUpdateSchema } from '../validator'
import { prisma } from '../db/prisma'
import { formatError } from '../utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { UserRole } from '@prisma/client' // ✅ enum Prisma
import { User } from '@prisma/client'

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    const hashedPassword = await bcrypt.hash(user.password, 5)

    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: UserRole.USER,
        email_verified: false,
      },
    })

    return { success: true, message: 'Utilisateur crée avec succès', data: createdUser }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// DELETE
export async function deleteUser(id: string) {
  try {
    const res = await prisma.user.delete({
      where: { id },
    })

    revalidatePath('/admin/users')

    return { success: true, message: 'Utilisateur supprimé avec succès' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: user._id },
      data: {
        name: user.name,
        email: user.email,
        role: user.role.toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.USER,
      },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE USER NAME (client fournit l'ID maintenant)
export async function updateUserName(userId: string, name: string) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    })

    return { success: true, message: 'User updated successfully', data: updatedUser }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// AUTHENTICATION (sans NextAuth)
export async function signInWithCredentials(user: IUserSignIn) {
  try {
    const foundUser = await prisma.user.findUnique({ where: { email: user.email } })
    if (!foundUser || !foundUser.password) {
      return { success: false, message: 'Email ou mot de passe incorrect' }
    }

    const isMatch = await bcrypt.compare(user.password, foundUser.password)
    if (!isMatch) return { success: false, message: 'Email ou mot de passe incorrect' }

    // Ici tu peux générer ton JWT si tu veux
    return { success: true, data: foundUser }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number
  page: number
}): Promise<{
  data: User[]
  totalPages: number
}> {
 

  const take = limit || 10
  const skip = (page - 1) * take

  const [users, usersCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.user.count(),
  ])

  return {
    data: users,
    totalPages: Math.ceil(usersCount / take),
  }
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new Error('User not found')
  return user
}

// SIGN OUT (stateless – sans cookies, sans session serveur)
export async function SignOut() {
  // Rien à faire côté serveur
  // La vraie déconnexion est gérée côté client (Zustand + sessionStorage)
  return { success: true }
}