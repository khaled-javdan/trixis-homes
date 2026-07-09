import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const __dirname = dirname(fileURLToPath(import.meta.url))

type UnitTypeInput = {
  propertyType: string
  bedrooms: number | null
  label: string
  unitCount: number | null
  startingPrice: number
  size: number | null
  notes: string | null
}

type ProjectInput = {
  name: string
  developer: string
  city: string
  community: string
  location: string
  handoverDate: string | null
  paymentPlan: string | null
  downPaymentPercent: number | null
  promoPaymentPlan: string | null
  promoDownPaymentPercent: number | null
  promotionNotes: string | null
  serviceCharge: number | null
  availableUnitsCount: number | null
  unitTypes: UnitTypeInput[]
}

async function main() {
  const projects: ProjectInput[] = JSON.parse(
    readFileSync(join(__dirname, "aldar-import-data.json"), "utf-8")
  )

  await prisma.attachment.deleteMany()
  await prisma.note.deleteMany()
  await prisma.paymentMilestone.deleteMany()
  await prisma.unitType.deleteMany()
  await prisma.project.deleteMany()

  for (const p of projects) {
    await prisma.project.create({
      data: {
        name: p.name,
        developer: p.developer,
        city: p.city,
        community: p.community,
        location: p.location,
        handoverDate: p.handoverDate ? new Date(p.handoverDate) : null,
        paymentPlan: p.paymentPlan,
        downPaymentPercent: p.downPaymentPercent,
        promoPaymentPlan: p.promoPaymentPlan,
        promoDownPaymentPercent: p.promoDownPaymentPercent,
        promotionNotes: p.promotionNotes,
        serviceCharge: p.serviceCharge,
        availableUnitsCount: p.availableUnitsCount,
        unitTypes: {
          create: p.unitTypes.map((u) => ({
            propertyType: u.propertyType as never,
            bedrooms: u.bedrooms,
            label: u.label,
            unitCount: u.unitCount,
            startingPrice: u.startingPrice,
            size: u.size,
            notes: u.notes,
          })),
        },
      },
    })
  }

  console.log(`Seed complete. ${projects.length} projects imported.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
