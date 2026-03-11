import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

  // Clean existing data to avoid unique constraint errors during multiple seed runs
  await prisma.book.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // User 1: J.K. Rowling
  const user1 = await prisma.user.create({
    data: {
      email: 'jkrowling@example.com',
      password,
      profile: {
        create: {
          firstName: 'J.K.',
          lastName: 'Rowling',
          phone: '+44 1234567890',
          address: 'London, UK',
        },
      },
    },
    include: { profile: true },
  });

  // User 2: George R.R. Martin
  const user2 = await prisma.user.create({
    data: {
      email: 'grrm@example.com',
      password,
      profile: {
        create: {
          firstName: 'George R.R.',
          lastName: 'Martin',
          phone: '+1 9876543210',
          address: 'Santa Fe, NM',
        },
      },
    },
    include: { profile: true },
  });

  // User 3: Normal Reader
  const user3 = await prisma.user.create({
    data: {
      email: 'reader@example.com',
      password,
      profile: {
        create: {
          firstName: 'Avid',
          lastName: 'Reader',
          phone: '0000000000',
          address: 'Anywhere',
        },
      },
    },
    include: { profile: true },
  });

  // Create Books using the newly seeded authors
  await prisma.book.createMany({
    data: [
      {
        title: "Harry Potter and the Sorcerer's Stone",
        description: "A boy discovers he is a wizard.",
        published: true,
        authorId: user1.profile!.id,
      },
      {
        title: "Harry Potter and the Chamber of Secrets",
        description: "A boy goes back to wizard school.",
        published: true,
        authorId: user1.profile!.id,
      },
      {
        title: "A Game of Thrones",
        description: "Winter is coming.",
        published: true,
        authorId: user2.profile!.id,
      },
      {
        title: "The Winds of Winter",
        description: "Still waiting...",
        published: false,
        authorId: user2.profile!.id,
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
