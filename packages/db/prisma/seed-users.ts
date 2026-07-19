// Seeds the initial OWNER account so the switch from the shared password to
// per-user logins never locks anyone out. Idempotent: if the owner already
// exists, its password is left untouched (re-runnable safely).
//
//   cd packages/db && pnpm tsx prisma/seed-users.ts
//
// Reads (from the environment, e.g. `source ../../apps/web/.env.local`):
//   DATABASE_URL      — the Neon connection string
//   OWNER_EMAIL       — defaults to admin@trixishomes.com
//   ADMIN_PASSWORD    — the current shared password, reused as the owner's
//                       initial password (change it from the /members page).

import { randomBytes, scryptSync } from "node:crypto"

import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Must match verifyPassword() in apps/web/lib/auth.ts.
function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const derived = scryptSync(password, salt, 64)
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`
}

async function main() {
  const email = (process.env.OWNER_EMAIL ?? "admin@trixishomes.com").toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Never clobber an edited password; just make sure they're an active owner.
    if (existing.role !== "OWNER" || existing.status !== "ACTIVE") {
      await prisma.user.update({
        where: { email },
        data: { role: "OWNER", status: "ACTIVE" },
      })
      console.log(`Promoted existing user ${email} to active OWNER.`)
    } else {
      console.log(`Owner ${email} already exists — leaving password untouched.`)
    }
    return
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not set — cannot seed the initial owner password."
    )
  }

  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      passwordHash: hashPassword(password),
      role: "OWNER",
      status: "ACTIVE",
    },
  })
  console.log(`Created owner ${email} (initial password = ADMIN_PASSWORD).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
