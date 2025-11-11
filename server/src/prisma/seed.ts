// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword123",
      role: "ADMIN",
    },
  });

  const salesRep = await prisma.user.create({
    data: {
      name: "Sales Rep",
      email: "rep@example.com",
      password: "hashedpassword123",
      role: "USER",
    },
  });

  // --- Accounts ---
  const acme = await prisma.account.create({
    data: {
      name: "Acme Corporation",
      website: "https://acme.test",
      industry: "Manufacturing",
      ownerId: admin.id,
    },
  });

  const globex = await prisma.account.create({
    data: {
      name: "Globex Industries",
      website: "https://globex.test",
      industry: "Software",
      ownerId: salesRep.id,
    },
  });

  // --- Contacts ---
  await prisma.contact.createMany({
    data: [
      {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@acme.test",
        phone: "555-1234",
        accountId: acme.id,
        ownerId: salesRep.id,
      },
      {
        firstName: "Bob",
        lastName: "Jones",
        email: "bob@globex.test",
        accountId: globex.id,
        ownerId: salesRep.id,
      },
    ],
  });

  // --- Deals ---
  await prisma.deal.create({
    data: {
      name: "Acme Partnership",
      amount: 50000,
      stage: "Negotiation",
      accountId: acme.id,
      ownerId: salesRep.id,
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
