import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "./generated/prisma/client"

const g = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = g.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") g.prisma = prisma
