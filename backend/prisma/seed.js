import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'optique-martin@example.com',
      password: await bcrypt.hash('password123', 10),
      shopName: 'Optique Martin',
      address: '123 Rue de Paris',
      phone: '01 23 45 67 89',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'vision-plus@example.com',
      password: await bcrypt.hash('password123', 10),
      shopName: 'Vision Plus',
      address: '456 Avenue des Champs',
      phone: '02 34 56 78 90',
    },
  })

  console.log('✅ Created users:', user1.id, user2.id)

  // Create user points
  await prisma.userPoints.create({
    data: {
      userId: user1.id,
      balance: 100,
    },
  })

  await prisma.userPoints.create({
    data: {
      userId: user2.id,
      balance: 50,
    },
  })

  // Create test listings
  const listing1 = await prisma.listing.create({
    data: {
      userId: user1.id,
      title: 'Monture Ray-Ban Wayfarer - Taille M',
      brand: 'Ray-Ban',
      reference: 'RB2140',
      size: 'M',
      condition: 'excellent',
      description: 'Très bon état, légères traces d\'usage.',
      indicativeValue: 120,
      searchingFor: 'Montures Oakley ou Persol',
      location: 'Paris',
    },
  })

  const listing2 = await prisma.listing.create({
    data: {
      userId: user2.id,
      title: 'Monture Persol - Taille L',
      brand: 'Persol',
      reference: 'PO3077',
      size: 'L',
      condition: 'bon',
      description: 'État correct, quelques rayures légères.',
      indicativeValue: 150,
      searchingFor: 'Montures Ray-Ban ou Gucci',
      location: 'Lyon',
    },
  })

  console.log('✅ Created listings:', listing1.id, listing2.id)

  // Create verification (pending)
  await prisma.verification.create({
    data: {
      userId: user1.id,
      adeliNumber: '1234567890',
      status: 'pending',
    },
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
