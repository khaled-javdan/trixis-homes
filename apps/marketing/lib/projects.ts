import {
  prisma,
  type Attachment,
  type Prisma,
  type ProjectStatus,
  type PropertyType,
  type UnitType,
} from "@workspace/db"

// Everything exported from this module is safe to render publicly. Internal
// fields (notes, ratings, promo terms, per-unit inventory) and gated file
// URLs (brochures, floor plans, price lists) are deliberately never mapped —
// gated files are only released by POST /api/leads after contact capture.

export type SizeRange = { min: number; max: number }

export type PublicProjectCard = {
  id: string
  slug: string
  name: string
  developer: string
  area: string
  city: string | null
  status: ProjectStatus
  startingPrice: number | null
  completionYear: number | null
  bedrooms: number[]
  propertyTypes: PropertyType[]
  coverImageUrl: string | null
}

export type PublicUnitTypeTeaser = {
  id: string
  name: string
  propertyType: PropertyType
  bedrooms: number | null
  startingPrice: number | null
  sizeRange: SizeRange | null
}

export type PublicProjectDetail = PublicProjectCard & {
  description: string | null
  location: string
  masterCommunity: string | null
  community: string | null
  handoverDate: string | null
  paymentPlan: string | null
  downPaymentPercent: number | null
  amenities: string[]
  sellingPoints: string[]
  waterfront: boolean
  golf: boolean
  brandedResidence: boolean
  brandName: string | null
  sizeRange: SizeRange | null
  gallery: string[]
  paymentMilestones: { label: string; percentage: number }[]
  unitTypes: PublicUnitTypeTeaser[]
  hasBrochure: boolean
  hasFloorPlans: boolean
  hasPriceList: boolean
}

type Decimalish = { toNumber(): number }

function toNumber(value: unknown): number | null {
  return value == null ? null : (value as Decimalish).toNumber()
}

function sizeRange(values: (number | null)[]): SizeRange | null {
  const present = values.filter((value): value is number => value != null)
  if (!present.length) return null
  return { min: Math.min(...present), max: Math.max(...present) }
}

function startingPrice(unitTypes: UnitType[]): number | null {
  const prices = unitTypes.map((unit) =>
    (unit.startingPrice as unknown as Decimalish).toNumber()
  )
  return prices.length ? Math.min(...prices) : null
}

function uniqueBedrooms(unitTypes: UnitType[]): number[] {
  return [
    ...new Set(
      unitTypes
        .map((unit) => unit.bedrooms)
        .filter((count): count is number => count != null)
    ),
  ].sort((a, b) => a - b)
}

function uniquePropertyTypes(unitTypes: UnitType[]): PropertyType[] {
  return [...new Set(unitTypes.map((unit) => unit.propertyType))]
}

function coverImageUrl(attachments: Attachment[]): string | null {
  const images = attachments.filter((a) => a.category === "IMAGE")
  if (!images.length) return null
  return (images.find((image) => image.isCover) ?? images[0]!).url
}

const cardInclude = {
  unitTypes: true,
  attachments: {
    where: { category: "IMAGE" },
    orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }],
  },
} satisfies Prisma.ProjectInclude

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof cardInclude
}>

function toCard(project: ProjectWithRelations): PublicProjectCard {
  return {
    id: project.id,
    // Published projects always have a slug (set by the publish action); the
    // id fallback keeps links working if one was published another way.
    slug: project.slug ?? project.id,
    name: project.name,
    developer: project.developer,
    area: project.community ?? project.masterCommunity ?? project.location,
    city: project.city,
    status: project.status,
    startingPrice: startingPrice(project.unitTypes),
    completionYear: project.handoverDate
      ? project.handoverDate.getFullYear()
      : null,
    bedrooms: uniqueBedrooms(project.unitTypes),
    propertyTypes: uniquePropertyTypes(project.unitTypes),
    coverImageUrl: coverImageUrl(project.attachments),
  }
}

export type PublicProjectFilters = {
  // Free-text search across project name, developer, area, and unit types.
  search?: string
  developer?: string
  community?: string
  propertyType?: PropertyType
  bedrooms?: number[] // values >= 5 mean "5+"
  maxPrice?: number
}

// Lets a free-text search like "villa" or "penthouse" match unit types even
// when a unit has no free-text label — the property type is an enum, so it
// can't be matched with a `contains`.
const PROPERTY_TYPE_KEYWORDS: Record<string, PropertyType> = {
  apartment: "APARTMENT",
  flat: "APARTMENT",
  townhouse: "TOWNHOUSE",
  villa: "VILLA",
  penthouse: "PENTHOUSE",
  duplex: "DUPLEX",
  office: "OFFICE",
  retail: "RETAIL",
  shop: "RETAIL",
}

function matchedPropertyTypes(query: string): PropertyType[] {
  const q = query.toLowerCase()
  if (q.length < 3) return []
  const matched = new Set<PropertyType>()
  for (const [word, type] of Object.entries(PROPERTY_TYPE_KEYWORDS)) {
    if (word.includes(q) || q.includes(word)) matched.add(type)
  }
  return [...matched]
}

// Unit-level conditions shared by the project `where` (as a `some` clause)
// and the stats aggregate (directly on UnitType).
function unitTypeConditions(
  filters: PublicProjectFilters
): Prisma.UnitTypeWhereInput[] {
  const conditions: Prisma.UnitTypeWhereInput[] = []
  if (filters.propertyType) {
    conditions.push({ propertyType: filters.propertyType })
  }
  if (filters.bedrooms?.length) {
    conditions.push({
      OR: filters.bedrooms.map((count) =>
        count >= 5 ? { bedrooms: { gte: 5 } } : { bedrooms: count }
      ),
    })
  }
  if (filters.maxPrice != null) {
    conditions.push({ startingPrice: { lte: filters.maxPrice } })
  }
  return conditions
}

function buildPublishedWhere(
  filters: PublicProjectFilters
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { isPublished: true }

  if (filters.search) {
    const q = filters.search
    const searchOr: Prisma.ProjectWhereInput[] = [
      { name: { contains: q, mode: "insensitive" } },
      { developer: { contains: q, mode: "insensitive" } },
      { community: { contains: q, mode: "insensitive" } },
      { masterCommunity: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { unitTypes: { some: { label: { contains: q, mode: "insensitive" } } } },
    ]
    const types = matchedPropertyTypes(q)
    if (types.length) {
      searchOr.push({ unitTypes: { some: { propertyType: { in: types } } } })
    }
    // Kept in `AND` so it composes with the `OR` the community filter may set.
    where.AND = [{ OR: searchOr }]
  }

  if (filters.developer) {
    // Loose match so "Aldar" (brand list) finds "Aldar Properties" (DB value).
    where.developer = { contains: filters.developer, mode: "insensitive" }
  }
  if (filters.community) {
    where.OR = [
      { community: { contains: filters.community, mode: "insensitive" } },
      { masterCommunity: { contains: filters.community, mode: "insensitive" } },
      { location: { contains: filters.community, mode: "insensitive" } },
      { city: { contains: filters.community, mode: "insensitive" } },
    ]
  }

  const unitConditions = unitTypeConditions(filters)
  if (unitConditions.length) {
    where.unitTypes = { some: { AND: unitConditions } }
  }

  return where
}

export async function getPublishedProjects(
  filters: PublicProjectFilters = {},
  limit?: number
): Promise<PublicProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: buildPublishedWhere(filters),
    include: cardInclude,
    orderBy: { updatedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  })
  return projects.map(toCard)
}

export type PublishedProjectStats = {
  count: number
  minPrice: number | null
}

/** Aggregate for the hero search card's live "N projects from AED X" line.
 * minPrice honors the unit-level filters, so it reflects the cheapest unit
 * the visitor could actually land on — not just the cheapest in the project. */
export async function getPublishedProjectStats(
  filters: PublicProjectFilters = {}
): Promise<PublishedProjectStats> {
  const where = buildPublishedWhere(filters)
  const [count, priceAggregate] = await Promise.all([
    prisma.project.count({ where }),
    prisma.unitType.aggregate({
      _min: { startingPrice: true },
      where: { project: { is: where }, AND: unitTypeConditions(filters) },
    }),
  ])
  return {
    count,
    minPrice: toNumber(priceAggregate._min.startingPrice),
  }
}

function unitTypeName(unit: UnitType): string {
  if (unit.label) return unit.label
  const typeLabel =
    unit.propertyType === "APARTMENT"
      ? "Apartment"
      : unit.propertyType.charAt(0) +
        unit.propertyType.slice(1).toLowerCase().replace("_", " ")
  if (unit.bedrooms == null) return typeLabel
  if (unit.bedrooms === 0) return `Studio ${typeLabel}`
  return `${unit.bedrooms} Bedroom ${typeLabel}`
}

export async function getPublishedProject(
  slug: string
): Promise<PublicProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: { isPublished: true, OR: [{ slug }, { id: slug }] },
    include: {
      unitTypes: { orderBy: { startingPrice: "asc" } },
      attachments: { orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }] },
      paymentMilestones: { orderBy: { date: "asc" } },
    },
  })
  if (!project) return null

  const categories = new Set(project.attachments.map((a) => a.category))

  return {
    ...toCard(project),
    description: project.description,
    location: project.location,
    masterCommunity: project.masterCommunity,
    community: project.community,
    handoverDate: project.handoverDate
      ? project.handoverDate.toISOString()
      : null,
    paymentPlan: project.paymentPlan,
    downPaymentPercent: toNumber(project.downPaymentPercent),
    amenities: project.amenities,
    sellingPoints: project.sellingPoints,
    waterfront: project.waterfront,
    golf: project.golf,
    brandedResidence: project.brandedResidence,
    brandName: project.brandName,
    sizeRange: sizeRange([
      ...project.unitTypes.map((unit) => toNumber(unit.size)),
      ...project.unitTypes.map((unit) => toNumber(unit.bua)),
    ]),
    gallery: project.attachments
      .filter((attachment) => attachment.category === "IMAGE")
      .map((attachment) => attachment.url),
    paymentMilestones: project.paymentMilestones.map((milestone) => ({
      label: milestone.label,
      percentage: toNumber(milestone.percentage)!,
    })),
    unitTypes: project.unitTypes.map((unit) => ({
      id: unit.id,
      name: unitTypeName(unit),
      propertyType: unit.propertyType,
      bedrooms: unit.bedrooms,
      startingPrice: toNumber(unit.startingPrice),
      sizeRange: sizeRange([toNumber(unit.size), toNumber(unit.bua)]),
    })),
    hasBrochure: categories.has("BROCHURE"),
    hasFloorPlans: categories.has("FLOOR_PLAN"),
    hasPriceList: categories.has("PRICE_LIST"),
  }
}

export type HotProject = {
  id: string
  slug: string
  name: string
  developer: string
  area: string
  city: string | null
  status: ProjectStatus
  startingPrice: number | null
  completionYear: number | null
  paymentPlan: string | null
  coverImageUrl: string | null
}

/** Projects featured in the home-page slider (admin "Mark as Hot"). */
export async function getHotProjects(limit = 6): Promise<HotProject[]> {
  const projects = await prisma.project.findMany({
    where: { isPublished: true, isHot: true },
    include: cardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  })
  return projects.map((project) => ({
    ...toCard(project),
    paymentPlan: project.paymentPlan,
  }))
}

export type PublicDeveloper = {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  logoUrl: string | null
  websiteUrl: string | null
  isVisible: boolean
}

/** Editorial developer content configured in the admin app. Hidden rows are
 * included so callers can suppress their project-derived fallback cards too —
 * only `isVisible` rows may be rendered. */
export async function getPublicDevelopers(): Promise<PublicDeveloper[]> {
  const rows = await prisma.developer.findMany({ orderBy: { name: "asc" } })
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    logoUrl: row.logoUrl,
    websiteUrl: row.websiteUrl,
    isVisible: row.isVisible,
  }))
}

export type PublishedDeveloperStat = {
  developer: string
  projectCount: number
  coverImageUrl: string | null
}

/** Per-developer stats over published projects, for the /developers page. */
export async function getPublishedDeveloperStats(): Promise<
  PublishedDeveloperStat[]
> {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    select: {
      developer: true,
      attachments: {
        where: { category: "IMAGE" },
        orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const stats = new Map<string, PublishedDeveloperStat>()
  for (const project of projects) {
    const existing = stats.get(project.developer)
    if (existing) {
      existing.projectCount += 1
      existing.coverImageUrl ??= project.attachments[0]?.url ?? null
    } else {
      stats.set(project.developer, {
        developer: project.developer,
        projectCount: 1,
        coverImageUrl: project.attachments[0]?.url ?? null,
      })
    }
  }
  return [...stats.values()]
}

export async function getOtherPublishedProjects(
  excludeId: string,
  limit = 3
): Promise<PublicProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: { isPublished: true, id: { not: excludeId } },
    include: cardInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  })
  return projects.map(toCard)
}
