// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding game store database...");

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

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@example.com",
      password: "$2b$10$ypnznFeajLVCZRyLDcfcNeL4eGFPm4MuuEarGY/bhFTCdVov5Em7a", // password123
      role: "MANAGER",
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: "Cashier",
      email: "sales@example.com",
      password: "$2b$10$ypnznFeajLVCZRyLDcfcNeL4eGFPm4MuuEarGY/bhFTCdVov5Em7a", // password123
      role: "USER",
    },
  });

  // --- Customers ---
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "John's Game Store",
        email: "john@gamestore.local",
        phone: "555-0001",
        loyaltyTier: "GOLD",
        totalSpent: 5250.00,
        ownerId: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Dragon's Lair Gaming",
        email: "dragons@gaming.local",
        phone: "555-0002",
        loyaltyTier: "PLATINUM",
        totalSpent: 8750.00,
        ownerId: manager.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pixel Paradise",
        email: "pixels@paradise.local",
        phone: "555-0003",
        loyaltyTier: "GOLD",
        totalSpent: 4200.00,
        ownerId: cashier.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Console Kings",
        email: "kings@console.local",
        phone: "555-0004",
        loyaltyTier: "STANDARD",
        totalSpent: 1850.00,
        ownerId: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Retro Legends",
        email: "retro@legends.local",
        phone: "555-0005",
        loyaltyTier: "GOLD",
        totalSpent: 3200.00,
        ownerId: manager.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Epic Quest Hub",
        email: "quest@epic.local",
        phone: "555-0006",
        loyaltyTier: "STANDARD",
        totalSpent: 950.00,
        ownerId: cashier.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "The Gamer's Den",
        email: "den@gamers.local",
        phone: "555-0007",
        loyaltyTier: "PLATINUM",
        totalSpent: 12500.00,
        ownerId: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Level Up Gaming",
        email: "levelup@gaming.local",
        phone: "555-0008",
        loyaltyTier: "GOLD",
        totalSpent: 6750.00,
        ownerId: manager.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Arcade Legends",
        email: "arcade@legends.local",
        phone: "555-0009",
        loyaltyTier: "STANDARD",
        totalSpent: 1200.00,
        ownerId: cashier.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "FPS Fanatics",
        email: "fps@fanatics.local",
        phone: "555-0010",
        loyaltyTier: "GOLD",
        totalSpent: 5900.00,
        ownerId: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "RPG Paradise",
        email: "rpg@paradise.local",
        phone: "555-0011",
        loyaltyTier: "STANDARD",
        totalSpent: 2100.00,
        ownerId: manager.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Speedrun Station",
        email: "speedrun@station.local",
        phone: "555-0012",
        loyaltyTier: "PLATINUM",
        totalSpent: 9500.00,
        ownerId: cashier.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Indie Café",
        email: "indie@cafe.local",
        phone: "555-0013",
        loyaltyTier: "GOLD",
        totalSpent: 3450.00,
        ownerId: admin.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Casual Gaming Hub",
        email: "casual@gaming.local",
        phone: "555-0014",
        loyaltyTier: "STANDARD",
        totalSpent: 750.00,
        ownerId: manager.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pro Esports Zone",
        email: "esports@pro.local",
        phone: "555-0015",
        loyaltyTier: "PLATINUM",
        totalSpent: 11250.00,
        ownerId: cashier.id,
      },
    }),
  ]);

  // --- Games ---
  const games = await Promise.all([
    // Popular AAA Games
    prisma.game.create({
      data: {
        mobyGameId: 54821,
        name: "The Legend of Zelda: Tears of the Kingdom",
        platform: "NINTENDO",
        genre: "Action-Adventure",
        description: "An expansive open-world adventure with puzzle-solving and combat.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Zelda+TOTK",
        releaseDate: new Date("2023-05-12"),
        price: 59.99,
        stockLevel: 12,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54570,
        name: "Elden Ring",
        platform: "XBOX",
        genre: "Action RPG",
        description: "A challenging dark fantasy RPG with exploration and boss battles.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Elden+Ring",
        releaseDate: new Date("2022-02-25"),
        price: 49.99,
        stockLevel: 15,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54520,
        name: "Elden Ring",
        platform: "PLAYSTATION",
        genre: "Action RPG",
        description: "A challenging dark fantasy RPG with exploration and boss battles.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Elden+Ring",
        releaseDate: new Date("2022-02-25"),
        price: 49.99,
        stockLevel: 18,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54100,
        name: "Final Fantasy XVI",
        platform: "PLAYSTATION",
        genre: "JRPG",
        description: "An epic fantasy tale with dynamic combat system.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=FF16",
        releaseDate: new Date("2023-06-22"),
        price: 59.99,
        stockLevel: 8,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53800,
        name: "Baldur's Gate 3",
        platform: "PC",
        genre: "CRPG",
        description: "A richly detailed fantasy RPG with branching storylines.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=BG3",
        releaseDate: new Date("2023-08-03"),
        price: 59.99,
        stockLevel: 22,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53700,
        name: "Starfield",
        platform: "XBOX",
        genre: "Action RPG",
        description: "An expansive space exploration RPG.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Starfield",
        releaseDate: new Date("2023-09-06"),
        price: 59.99,
        stockLevel: 14,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53600,
        name: "Cyberpunk 2077",
        platform: "PC",
        genre: "Action RPG",
        description: "A futuristic cyberpunk RPG with immersive storytelling.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Cyberpunk",
        releaseDate: new Date("2020-12-10"),
        price: 39.99,
        stockLevel: 11,
      },
    }),
    prisma.game.create({
      data: {
        name: "Minecraft",
        platform: "MOBILE",
        genre: "Sandbox",
        description: "The ultimate sandbox building and exploration game.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Minecraft",
        releaseDate: new Date("2011-05-17"),
        price: 19.99,
        stockLevel: 45,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54420,
        name: "Palworld",
        platform: "PC",
        genre: "Action RPG",
        description: "A creature-catching adventure with base building.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Palworld",
        releaseDate: new Date("2024-01-18"),
        price: 29.99,
        stockLevel: 19,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54300,
        name: "Dragon's Dogma 2",
        platform: "XBOX",
        genre: "Action RPG",
        description: "A fantasy RPG with dynamic pawn system.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=DD2",
        releaseDate: new Date("2024-03-22"),
        price: 59.99,
        stockLevel: 10,
      },
    }),
    // Racing Games
    prisma.game.create({
      data: {
        mobyGameId: 54200,
        name: "Forza Motorsport 5",
        platform: "XBOX",
        genre: "Racing",
        description: "High-octane racing simulation.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Forza5",
        releaseDate: new Date("2023-10-10"),
        price: 49.99,
        stockLevel: 13,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 54150,
        name: "Gran Turismo 7",
        platform: "PLAYSTATION",
        genre: "Racing",
        description: "Ultimate racing simulation on PlayStation.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=GT7",
        releaseDate: new Date("2022-03-04"),
        price: 49.99,
        stockLevel: 16,
      },
    }),
    // Shooter Games
    prisma.game.create({
      data: {
        mobyGameId: 54050,
        name: "Call of Duty: Modern Warfare III",
        platform: "PC",
        genre: "FPS",
        description: "Tactical first-person shooter.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=COD+MW3",
        releaseDate: new Date("2023-11-10"),
        price: 59.99,
        stockLevel: 17,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53950,
        name: "Destiny 2",
        platform: "PC",
        genre: "FPS",
        description: "Online cooperative first-person shooter.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Destiny2",
        releaseDate: new Date("2017-09-06"),
        price: 0.00,
        stockLevel: 999,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53900,
        name: "Halo Infinite",
        platform: "XBOX",
        genre: "FPS",
        description: "The next chapter in the Halo series.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Halo",
        releaseDate: new Date("2021-12-08"),
        price: 0.00,
        stockLevel: 999,
      },
    }),
    // Adventure Games
    prisma.game.create({
      data: {
        mobyGameId: 53850,
        name: "A Plague Tale: Requiem",
        platform: "PLAYSTATION",
        genre: "Adventure",
        description: "A cinematic adventure through plague-ridden lands.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Plague+Tale",
        releaseDate: new Date("2022-10-18"),
        price: 39.99,
        stockLevel: 9,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53750,
        name: "Uncharted: Legacy of Thieves Collection",
        platform: "PLAYSTATION",
        genre: "Adventure",
        description: "Remastered adventure classic.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Uncharted",
        releaseDate: new Date("2022-01-28"),
        price: 39.99,
        stockLevel: 11,
      },
    }),
    // Sports Games
    prisma.game.create({
      data: {
        mobyGameId: 53700,
        name: "NBA 2K24",
        platform: "XBOX",
        genre: "Sports",
        description: "Professional basketball simulation.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=NBA+2K24",
        releaseDate: new Date("2023-09-08"),
        price: 59.99,
        stockLevel: 14,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 53600,
        name: "Madden NFL 24",
        platform: "PLAYSTATION",
        genre: "Sports",
        description: "American football simulation.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Madden+24",
        releaseDate: new Date("2023-08-18"),
        price: 59.99,
        stockLevel: 12,
      },
    }),
    // Indie Games
    prisma.game.create({
      data: {
        mobyGameId: 52500,
        name: "Hollow Knight",
        platform: "NINTENDO",
        genre: "Metroidvania",
        description: "A challenging hand-drawn adventure.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=HollowKnight",
        releaseDate: new Date("2017-02-24"),
        price: 14.99,
        stockLevel: 25,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 52400,
        name: "Celeste",
        platform: "NINTENDO",
        genre: "Platformer",
        description: "A pixel-perfect platformer with emotional story.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Celeste",
        releaseDate: new Date("2018-01-25"),
        price: 19.99,
        stockLevel: 20,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 52300,
        name: "Stardew Valley",
        platform: "PC",
        genre: "Simulation",
        description: "A relaxing farming simulation game.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=StardewValley",
        releaseDate: new Date("2016-02-28"),
        price: 14.99,
        stockLevel: 35,
      },
    }),
    prisma.game.create({
      data: {
        mobyGameId: 52200,
        name: "Terraria",
        platform: "PC",
        genre: "Sandbox",
        description: "2D sandbox with exploration and building.",
        coverArtUrl: "https://via.placeholder.com/300x400?text=Terraria",
        releaseDate: new Date("2011-05-16"),
        price: 24.99,
        stockLevel: 28,
      },
    }),
  ]);

  // --- Sample Sales with Line Items ---
  for (let i = 0; i < 8; i++) {
    const randomCustomer =
      customers[Math.floor(Math.random() * customers.length)];
    const randomUser =
      [admin, manager, cashier][Math.floor(Math.random() * 3)];

    // Select 2-4 random games for this sale
    const gameCount = Math.floor(Math.random() * 3) + 2;
    const saleGames: (typeof games)[number][] = [];
    const usedIndices = new Set<number>();

    while (saleGames.length < gameCount && usedIndices.size < games.length) {
      const idx = Math.floor(Math.random() * games.length);
      if (!usedIndices.has(idx)) {
        saleGames.push(games[idx]);
        usedIndices.add(idx);
      }
    }

    let totalAmount = 0;
    const lineItems = saleGames.map((game) => {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const subtotal = game.price * quantity;
      totalAmount += subtotal;
      return {
        gameId: game.id,
        quantity,
        pricePerUnit: game.price,
        subtotal,
      };
    });

    await prisma.sale.create({
      data: {
        customerId: randomCustomer.id,
        ownerId: randomUser.id,
        totalAmount,
        status: "COMPLETED",
        saleDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        lineItems: {
          create: lineItems,
        },
      },
    });
  }

  console.log("✅ Game store seeding complete!");
  console.log(`📊 Created ${customers.length} customers`);
  console.log(`🎮 Created ${games.length} games`);
  console.log("💰 Created 8 sample sales");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
