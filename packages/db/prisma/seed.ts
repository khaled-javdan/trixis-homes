import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.attachment.deleteMany()
  await prisma.note.deleteMany()
  await prisma.unitType.deleteMany()
  await prisma.project.deleteMany()

  await prisma.project.create({
    data: {
      name: "Athlon by Aldar",
      developer: "Aldar Properties",
      community: "Yas Island",
      location: "Abu Dhabi",
      status: "UNDER_CONSTRUCTION",
      handoverDate: new Date("2027-09-30"),
      description:
        "A golf-course-facing master community on Yas Island featuring a mix of townhouses and villas aimed at end-users and investors alike.",
      paymentPlan: "60/40 (60% during construction, 40% on handover)",
      isFavorite: true,
      unitTypes: {
        create: [
          {
            propertyType: "TOWNHOUSE",
            label: "2BR Townhouse",
            startingPrice: 1950000,
            size: 1450,
            plotSize: 1800,
            bua: 1450,
            bedrooms: 2,
            bathrooms: 3,
            parking: 2,
          },
          {
            propertyType: "TOWNHOUSE",
            label: "3BR Townhouse",
            startingPrice: 2900000,
            size: 2100,
            plotSize: 2400,
            bua: 2100,
            bedrooms: 3,
            bathrooms: 4,
            parking: 2,
          },
          {
            propertyType: "VILLA",
            label: "4BR Villa",
            startingPrice: 4200000,
            size: 3200,
            plotSize: 4000,
            bua: 3200,
            bedrooms: 4,
            bathrooms: 5,
            parking: 3,
          },
        ],
      },
      notes: {
        create: [
          {
            body: "Popular with investors due to the golf-course view premium — units backing onto the fairway carry a 5-8% price uplift.",
          },
          {
            body: "Common objection: handover date feels far out. Counter with the payment plan being weighted 60/40, so cash outlay stays low until near handover.",
          },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      name: "Marina Vista",
      developer: "Emaar Properties",
      community: "Dubai Marina",
      location: "Dubai",
      status: "READY",
      handoverDate: new Date("2024-03-01"),
      description:
        "A ready-to-move waterfront tower in the heart of Dubai Marina with full marina and sea views.",
      paymentPlan: "100% on handover (ready unit, mortgage-eligible)",
      unitTypes: {
        create: [
          {
            propertyType: "APARTMENT",
            startingPrice: 1450000,
            size: 850,
            bedrooms: 1,
            bathrooms: 2,
            parking: 1,
          },
          {
            propertyType: "APARTMENT",
            startingPrice: 2350000,
            size: 1250,
            bedrooms: 2,
            bathrooms: 2,
            parking: 1,
          },
          {
            propertyType: "PENTHOUSE",
            startingPrice: 6800000,
            size: 3400,
            bedrooms: 4,
            bathrooms: 5,
            parking: 3,
            paymentPlan:
              "50% down payment, 50% on transfer (ready unit, negotiable)",
          },
        ],
      },
      notes: {
        create: [
          {
            body: "Ready unit — good fit for clients who want rental income immediately or can't wait for handover.",
          },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      name: "Sobha Hartland II",
      developer: "Sobha Realty",
      community: "Hartland",
      location: "Dubai",
      status: "OFF_PLAN",
      handoverDate: new Date("2028-06-30"),
      description:
        "A green, low-density waterfront community centered on a crystal lagoon, villas and townhouses only.",
      paymentPlan: "80/20 (80% during construction, 20% on handover)",
      unitTypes: {
        create: [
          {
            propertyType: "TOWNHOUSE",
            label: "3BR Townhouse",
            startingPrice: 3100000,
            size: 2250,
            plotSize: 2600,
            bua: 2250,
            bedrooms: 3,
            bathrooms: 4,
            parking: 2,
          },
          {
            propertyType: "VILLA",
            label: "5BR Villa",
            startingPrice: 7500000,
            size: 5200,
            plotSize: 6500,
            bua: 5200,
            bedrooms: 5,
            bathrooms: 6,
            parking: 4,
          },
        ],
      },
      notes: {
        create: [
          {
            body: "Compare against Athlon on lagoon access — Sobha's crystal lagoon is a stronger differentiator for family buyers than Athlon's golf course.",
          },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      name: "Reportage Village",
      developer: "Reportage Properties",
      community: "Masdar City",
      location: "Abu Dhabi",
      status: "OFF_PLAN",
      handoverDate: new Date("2027-12-31"),
      description:
        "An affordable, sustainability-focused community within Masdar City targeting first-time buyers.",
      paymentPlan:
        "40/60 (40% during construction, 60% post-handover over 3 years)",
      unitTypes: {
        create: [
          {
            propertyType: "APARTMENT",
            startingPrice: 620000,
            size: 450,
            bedrooms: 0,
            bathrooms: 1,
            parking: 1,
          },
          {
            propertyType: "APARTMENT",
            startingPrice: 890000,
            size: 720,
            bedrooms: 1,
            bathrooms: 1,
            parking: 1,
          },
        ],
      },
      notes: {
        create: [
          {
            body: "Strong entry-price option to redirect budget-conscious clients who balk at Athlon/Sobha pricing.",
          },
        ],
      },
    },
  })

  console.log("Seed complete.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
