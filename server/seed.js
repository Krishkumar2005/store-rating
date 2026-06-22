//const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { prisma } = require("./src/config/prisma.js");

// const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin
  const hashedPassword = await bcrypt.hash("Admin@1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@storerating.com" },
    update: {},
    create: {
      name: "System Administrator Account",
      email: "admin@storerating.com",
      password: hashedPassword,
      address: "123 Admin Street, System City, State 400001",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created:", admin.email);

  // Create a Store Owner
  const ownerPassword = await bcrypt.hash("Owner@1234", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@techstore.com" },
    update: {},
    create: {
      name: "Tech Store Owner Account User",
      email: "owner@techstore.com",
      password: ownerPassword,
      address: "456 Owner Lane, Business District, City 400002",
      role: "STORE_OWNER",
    },
  });

  // Create Store for owner
  await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: "Tech Electronics and Gadgets Store",
      email: "contact@techstore.com",
      address: "789 Market Street, Electronics Hub, City 400003",
      ownerId: owner.id,
    },
  });

  console.log("✅ Store owner and store created");

  // Create Normal User
  const userPassword = await bcrypt.hash("User@1234", 10);
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Normal User Test Account Demo",
      email: "user@example.com",
      password: userPassword,
      address: "321 User Street, Residential Area, City 400004",
      role: "USER",
    },
  });

  console.log("✅ Normal user created");
  console.log("\n📋 Seed credentials:");
  console.log("  Admin:       admin@storerating.com / Admin@1234");
  console.log("  Store Owner: owner@techstore.com   / Owner@1234");
  console.log("  Normal User: user@example.com      / User@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

