import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import data from '@/lib/data'


async function main() {
  console.log('Start seeding...')

  // --- USERS ---
  const hashedPassword = await bcrypt.hash('123456', 5)
  await prisma.user.deleteMany() // reset
  const createdUsers = await prisma.user.createMany({
    data: data.users.map((u) => ({
      name: u.name,
      email: u.email,
      password: hashedPassword,
      role: u.role === 'Admin' ? 'ADMIN' : 'USER',
      emailVerified: true,
    })),
  })

  // --- SETTINGS ---
  await prisma.setting.deleteMany()
  await prisma.setting.create({
    data: {
      id: '1',
      common: data.settings[0].common,
      site: data.settings[0].site,
      carousels: data.settings[0].carousels,
      availableLanguages: data.settings[0].availableLanguages,
      availableCurrencies: data.settings[0].availableCurrencies,
      availablePaymentMethods: data.settings[0].availablePaymentMethods,
      availableDeliveryDates: data.settings[0].availableDeliveryDates,
      defaultLanguage: data.settings[0].defaultLanguage,
      defaultCurrency: data.settings[0].defaultCurrency,
      defaultPaymentMethod: data.settings[0].defaultPaymentMethod,
      defaultDeliveryDate: data.settings[0].defaultDeliveryDate,
    },
  })



  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
