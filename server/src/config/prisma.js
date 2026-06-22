require("dotenv").config();
const { PrismaClient } = require("../../generated/prisma/client.js"); 
const { PrismaPg } = require("@prisma/adapter-pg"); 
const globalForPrisma = global
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
  }); 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 
module.exports = {prisma}; 