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
      password: "$2b$10$ypnznFeajLVCZRyLDcfcNeL4eGFPm4MuuEarGY/bhFTCdVov5Em7a", // password123
      role: "ADMIN",
    },
  });

  const salesRep = await prisma.user.create({
    data: {
      name: "Sales Rep",
      email: "rep@example.com",
      password: "$2b$10$ypnznFeajLVCZRyLDcfcNeL4eGFPm4MuuEarGY/bhFTCdVov5Em7a", // password123
      role: "USER",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@example.com",
      password: "$2b$10$ypnznFeajLVCZRyLDcfcNeL4eGFPm4MuuEarGY/bhFTCdVov5Em7a", // password123
      role: "MANAGER",
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

  const techCorp = await prisma.account.create({
    data: {
      name: "TechCorp Solutions",
      website: "https://techcorp.test",
      industry: "Technology",
      ownerId: admin.id,
    },
  });

  const retailInc = await prisma.account.create({
    data: {
      name: "Retail Inc",
      website: "https://retailinc.test",
      industry: "Retail",
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
        title: "CEO",
        accountId: acme.id,
        ownerId: salesRep.id,
      },
      {
        firstName: "Bob",
        lastName: "Jones",
        email: "bob@acme.test",
        phone: "555-5678",
        title: "CTO",
        accountId: acme.id,
        ownerId: admin.id,
      },
      {
        firstName: "Charlie",
        lastName: "Brown",
        email: "charlie@globex.test",
        phone: "555-9012",
        title: "VP Sales",
        accountId: globex.id,
        ownerId: salesRep.id,
      },
      {
        firstName: "Diana",
        lastName: "Prince",
        email: "diana@globex.test",
        phone: "555-3456",
        title: "Marketing Manager",
        accountId: globex.id,
        ownerId: manager.id,
      },
      {
        firstName: "Eve",
        lastName: "Adams",
        email: "eve@techcorp.test",
        phone: "555-7890",
        title: "Founder",
        accountId: techCorp.id,
        ownerId: admin.id,
      },
      {
        firstName: "Frank",
        lastName: "Miller",
        email: "frank@techcorp.test",
        phone: "555-1111",
        title: "Developer",
        accountId: techCorp.id,
        ownerId: salesRep.id,
      },
      {
        firstName: "Grace",
        lastName: "Lee",
        email: "grace@retailinc.test",
        phone: "555-2222",
        title: "Store Manager",
        accountId: retailInc.id,
        ownerId: salesRep.id,
      },
      {
        firstName: "Henry",
        lastName: "Wilson",
        email: "henry@retailinc.test",
        phone: "555-3333",
        title: "Buyer",
        accountId: retailInc.id,
        ownerId: manager.id,
      },
    ],
  });

  // --- Deals ---
  await prisma.deal.createMany({
    data: [
      {
        name: "Acme Partnership",
        amount: 50000,
        stage: "NEW",
        closeDate: new Date("2025-12-31"),
        accountId: acme.id,
        ownerId: salesRep.id,
      },
      {
        name: "Acme Expansion",
        amount: 75000,
        stage: "PROSPECTING",
        closeDate: new Date("2025-11-15"),
        accountId: acme.id,
        ownerId: admin.id,
      },
      {
        name: "Globex Deal",
        amount: 100000,
        stage: "QUALIFIED",
        closeDate: new Date("2025-10-20"),
        accountId: globex.id,
        ownerId: salesRep.id,
      },
      {
        name: "Globex Upgrade",
        amount: 60000,
        stage: "PROPOSAL",
        closeDate: new Date("2025-09-10"),
        accountId: globex.id,
        ownerId: manager.id,
      },
      {
        name: "TechCorp Contract",
        amount: 120000,
        stage: "WON",
        closeDate: new Date("2025-08-05"),
        accountId: techCorp.id,
        ownerId: admin.id,
      },
      {
        name: "TechCorp Pilot",
        amount: 30000,
        stage: "LOST",
        closeDate: new Date("2025-07-01"),
        accountId: techCorp.id,
        ownerId: salesRep.id,
      },
      {
        name: "Retail Partnership",
        amount: 80000,
        stage: "NEW",
        closeDate: new Date("2026-01-15"),
        accountId: retailInc.id,
        ownerId: salesRep.id,
      },
      {
        name: "Retail Expansion",
        amount: 45000,
        stage: "PROSPECTING",
        closeDate: new Date("2025-12-01"),
        accountId: retailInc.id,
        ownerId: manager.id,
      },
    ],
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
