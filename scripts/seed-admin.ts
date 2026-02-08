// scripts/seed-admin.ts
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

// Charger les variables d'environnement
dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL n'est pas définie")

// Créer directement Prisma avec Neon Adapter
const adapter = new PrismaNeon({ connectionString })

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
})

async function main() {
  const email = 'admin@example.com'
  const password = '123456'
  const name = 'Admin'

  // Vérifier si l'admin existe déjà
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`✅ Admin déjà présent : ${existing.email}`)
    return
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10)

  // Créer l'utilisateur ADMIN
  const adminUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      email_verified: true,
    },
  })

  console.log(`🎉 Admin créé avec succès : ${adminUser.email}`)
}

// Lancer le script
main()
  .catch((e) => console.error('❌ Erreur :', e))
  .finally(async () => {
    await prisma.$disconnect()
  })
