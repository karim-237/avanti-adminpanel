// auth.ts
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import NextAuth, { type DefaultSession, type User as NextAuthUser } from 'next-auth'
import { type JWT } from 'next-auth/jwt'

// ⚡ Étendre les types NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
  }
}

// Types explicites pour credentials
interface Credentials {
  email: string
  password: string
}

export const runtime = 'nodejs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'Email' },
        password: { label: 'Mot de passe', type: 'password', placeholder: 'Mot de passe' },
      },
      async authorize(credentials) {
        const creds = credentials as Credentials | undefined
        if (!creds?.email || !creds?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(creds.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name ?? '',
          email: user.email,
          role: user.role,
        } as NextAuthUser & { role: string; id: string }
      },
    }),
  ],

  callbacks: {
    // JWT callback : on stocke id et role
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    // Session callback : on injecte id et role dans session.user
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      }
    },
  },
})
