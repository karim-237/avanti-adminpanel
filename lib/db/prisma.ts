import dotenv from 'dotenv'
import { PrismaNeon } from '@prisma/adapter-neon'

// Charger les variables d'environnement
dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL n'est pas définie")

// ⚠️ Import “any” pour contourner le problème de TS sur v6
const PrismaClientPkg: any = require('@prisma/client')
const { PrismaClient } = PrismaClientPkg

// Adapter Neon
const adapter = new PrismaNeon({ connectionString })

// Pattern global pour Next.js / serverless
const globalForPrisma = globalThis as unknown as {
  prisma: typeof PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
