// Seeds editorial write-ups for the developer brands shown on the public
// /developers page. Idempotent: existing rows are never overwritten, so
// edits made in the admin app survive re-runs.
//
//   cd packages/db && pnpm tsx prisma/seed-developers.ts
//
// (Needs DATABASE_URL, e.g. `source ../../apps/web/.env.local`.)

import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const developers: { name: string; description: string }[] = [
  {
    name: "Emaar",
    description:
      "Emaar Properties is the developer most people picture when they think of Dubai — the company behind the Burj Khalifa, Dubai Mall, and Downtown Dubai itself. Founded in 1997, it has delivered over 100,000 homes and continues to set the pace of the market with master communities like Dubai Hills Estate, Dubai Creek Harbour, The Valley, and Emaar South.\n\nFor buyers, Emaar's appeal is predictability: projects hand over on schedule, build quality is consistent, and its communities historically hold the strongest resale and rental demand in the city.",
  },
  {
    name: "Aldar",
    description:
      "Aldar Properties is Abu Dhabi's flagship developer and one of the region's most financially solid, with government-linked backing and a portfolio spanning Yas Island, Saadiyat Island, and Al Reem. Its landmark HQ — the circular building on Al Raha beach — is a fitting symbol for a company that shaped the capital's skyline.\n\nAldar communities are known for complete, well-managed masterplans: schools, retail, golf, and beaches delivered alongside the homes. Its expansion into Dubai and strong delivery record have made Aldar launches some of the most in-demand in the UAE.",
  },
  {
    name: "Sobha",
    description:
      "Sobha Realty is the craftsmanship-first developer of Dubai's luxury segment. Its 'backward integration' model is unique: design, engineering, and construction are all handled in-house rather than subcontracted, which is why Sobha buildings are consistently cited for finish quality.\n\nSobha Hartland and Hartland II in MBR City anchor its portfolio — waterfront-adjacent, villa-and-tower communities minutes from Downtown — alongside statement towers like Sobha SeaHaven at Dubai Harbour.",
  },
  {
    name: "Damac",
    description:
      "DAMAC Properties is Dubai's highest-profile private luxury developer, famous for branded residences (Versace, Cavalli, de GRISOGONO) and for master communities built around golf and lagoons — DAMAC Hills, DAMAC Lagoons, and now DAMAC Islands.\n\nDAMAC launches are aggressive on payment plans and amenities, making them popular with investors chasing strong launch-to-handover appreciation in the lifestyle segment.",
  },
  {
    name: "Nakheel",
    description:
      "Nakheel is the master developer that literally reshaped Dubai's coastline — Palm Jumeirah is its work, and the next generation of waterfront living is too: Palm Jebel Ali, Dubai Islands, and District One. Now part of Dubai Holding, it combines government backing with some of the most ambitious land bank in the emirate.\n\nBuying Nakheel means buying location: island and beachfront addresses that cannot be replicated, with long-term capital appreciation driven by scarcity.",
  },
  {
    name: "Dubai South",
    description:
      "Dubai South is the government-backed master development rising around Al Maktoum International Airport — planned to be the world's largest — and the Expo 2020 legacy district. Its residential districts offer some of the most accessible pricing in Dubai, in a zone earmarked for decades of infrastructure investment.\n\nFor investors it's a long-horizon play: as the airport scales up and businesses relocate south, early residential buyers stand to benefit most.",
  },
  {
    name: "WASL",
    description:
      "Wasl is Dubai's semi-government developer, created by the Dubai Real Estate Corporation to manage and develop the emirate's own land assets. Its portfolio concentrates on established, central districts — Za'abeel, Al Jaddaf, Jumeirah — where private developers rarely get land.\n\nWasl projects pair institutional reliability with genuinely central addresses, and include landmark hospitality-led towers alongside mid-market residential communities.",
  },
  {
    name: "EXPO City",
    description:
      "Expo City Dubai is the permanent legacy of Expo 2020 — a car-light, sustainability-led district that kept the Expo's architecture and infrastructure and is growing into a full residential and business destination, anchored by the Dubai Exhibition Centre and the future airport corridor.\n\nResidences here suit buyers who want a masterplan built around walkability, green building standards, and a genuinely different urban feel from the rest of Dubai.",
  },
  {
    name: "Arada",
    description:
      "Arada is the UAE's fastest-growing private developer, founded in 2017 by Sharjah and Saudi royal family members. It made its name with Aljada — Sharjah's largest-ever mixed-use community — and the forested Masaar villa district, and has since entered Dubai with design-led high-rises.\n\nArada projects stand out for strong landscaping, wellness amenities, and rapid construction pace, with pricing that undercuts equivalent Dubai communities.",
  },
  {
    name: "Danube",
    description:
      "Danube Properties turned a building-materials business into one of Dubai's most recognisable developers by solving one problem: affordability. Its signature 1% monthly payment plan lets buyers pay for a home like a subscription, and its projects pack in amenities — pools, gyms, cinemas — at price points few competitors match.\n\nDanube suits first-time buyers and yield-focused investors: entry prices are low, rental demand in its communities is high, and handovers have been consistently on time.",
  },
  {
    name: "Binghatti",
    description:
      "Binghatti is Dubai's most visually distinctive developer — you can spot its interwoven, angular balconies from across the street. It builds fast (often under two years launch-to-handover) and has moved decisively upmarket through branded collaborations with Bugatti, Mercedes-Benz, and Jacob & Co.\n\nConcentrated in Business Bay, JVC, and Al Jaddaf, Binghatti towers offer bold design and quick capital rotation for investors who don't want long construction timelines.",
  },
  {
    name: "Azizi",
    description:
      "Azizi Developments is one of Dubai's most prolific private builders, with a delivery engine that rarely pauses — thousands of units across Al Furjan, Studio City, and MBR City, plus the kilometre-long Riviera community at Meydan with its crystal lagoon.\n\nAzizi suits buyers hunting mid-market value in connected locations: competitive pricing, French-Mediterranean design themes, and steady rental demand from the communities it has already handed over.",
  },
  {
    name: "Majid Al Futtaim",
    description:
      "Majid Al Futtaim is the lifestyle conglomerate behind Mall of the Emirates and Carrefour in the region — and, in residential, the developer of Tilal Al Ghaf, one of Dubai's most admired villa communities, built around the swimmable Lagoon Al Ghaf.\n\nIts developments trade on placemaking: schools, beaches, retail, and parkland arrive with the first residents, not years later, and premium villa phases like Serenity and Alaya lead the luxury villa resale market.",
  },
  {
    name: "Deyaar",
    description:
      "Deyaar Development is one of Dubai's established public developers, listed on the DFM and majority-owned by Dubai Islamic Bank. Two decades of delivery span Business Bay, Production City, and Al Furjan, with recent flagships like Regalia in Business Bay.\n\nDeyaar offers institutional governance and central locations at mid-market pricing — a steady choice for buyers who prioritise a listed company's accountability.",
  },
  {
    name: "Bloom",
    description:
      "Bloom Holding is an Abu Dhabi developer best known for Bloom Living — a fully integrated, Mediterranean-styled community near Zayed International Airport with schools, clinics, and retail woven into the masterplan from day one.\n\nIts projects favour end-users: generous townhouse and villa layouts, walkable neighbourhood design, and phased delivery that has stayed on schedule.",
  },
  {
    name: "Dar Global",
    description:
      "Dar Global is the international, luxury-focused arm of Saudi giant Dar Al Arkan, listed in London and specialised in branded living: Trump, Aston Martin, Missoni, and W-branded towers across Dubai's prime districts.\n\nIt targets globally mobile buyers who want a recognised luxury marque attached to their address, with design-led towers in locations like Downtown, Dubai Marina, and Jumeirah.",
  },
  {
    name: "Samana",
    description:
      "Samana Developers owns a niche no one else in Dubai occupies as completely: resort-style buildings where apartments come with private plunge pools on the balcony — at mid-market prices. Its investor-friendly plans often stretch payments years past handover.\n\nConcentrated in JVC, Arjan, and Dubai Studio City, Samana projects are built for the short-stay and rental market, where the private-pool premium drives standout yields.",
  },
  {
    name: "Nshama",
    description:
      "Nshama created Town Square Dubai — the value-for-money family neighbourhood that proved starter townhouses could still exist in Dubai. Tens of thousands of residents now live around its central park, retail boulevard, and cycling trails.\n\nFor first-time buyers and young families, Nshama remains one of the lowest entry points into townhouse ownership in the city, with an established, fully operating community rather than a promise on a masterplan.",
  },
  {
    name: "Beyond",
    description:
      "Beyond is the waterfront residential brand launched by Omniyat — the developer behind some of Dubai's most celebrated architecture — to bring its design standards to a broader luxury segment. Its first projects rise along Dubai Maritime City's new marina front.\n\nBeyond suits buyers who want Omniyat design DNA and sea views at a more accessible price point than the ultra-prime One at Palm tier.",
  },
  {
    name: "Reportage",
    description:
      "Reportage Properties is a value-driven developer delivering townhouse and apartment communities across Dubai, Abu Dhabi, and beyond, known for frequent launches and some of the market's most aggressive cash-payment discounts.\n\nIts communities — like Rukan and Verdana — target entry-level buyers and investors optimising for the lowest possible price per square foot in growth corridors.",
  },
]

async function main() {
  let created = 0
  for (const developer of developers) {
    const existing = await prisma.developer.findUnique({
      where: { name: developer.name },
      select: { id: true },
    })
    if (existing) continue
    await prisma.developer.create({ data: developer })
    created += 1
  }
  console.log(`Seeded ${created} developers (${developers.length - created} already existed).`)
  await prisma.$disconnect()
}

main()
