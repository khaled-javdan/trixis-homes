import "server-only"

import {
  prisma,
  type Prisma,
  type ProjectStatus,
  type PropertyType,
} from "@workspace/db"

import { toPlainProject, type PlainProject } from "./serialize"

export type DashboardFilters = {
  q?: string
  developers: string[]
  communities: string[]
  cities: string[]
  statuses: ProjectStatus[]
  propertyTypes: PropertyType[]
  bedrooms: number[] // 5 means "5+"
  paymentPlans: string[]
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  waterfront?: boolean
  golf?: boolean
  brandedResidence?: boolean
  promotionActive?: boolean
  onlyAvailable?: boolean
}

export type SizeRange = { min: number; max: number }

export type ProjectCard = PlainProject & {
  startingPrice: number | null
  maxPrice: number | null
  completionYear: number | null
  unitTypeCount: number
  totalUnitCount: number | null
  buaRange: SizeRange | null
  plotSizeRange: SizeRange | null
  coverImageUrl: string | null
}

function sizeRange(values: (number | null)[]): SizeRange | null {
  const present = values.filter((value): value is number => value != null)
  return present.length ? { min: Math.min(...present), max: Math.max(...present) } : null
}

function withCardFields(
  plain: PlainProject & { attachments: PlainProject["attachments"] }
): ProjectCard {
  const prices = plain.unitTypes.map((unit) => unit.startingPrice)
  const unitCounts = plain.unitTypes
    .map((unit) => unit.unitCount)
    .filter((count): count is number => count != null)
  return {
    ...plain,
    startingPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    completionYear: plain.handoverDate
      ? new Date(plain.handoverDate).getFullYear()
      : null,
    unitTypeCount: plain.unitTypes.length,
    totalUnitCount: unitCounts.length
      ? unitCounts.reduce((sum, count) => sum + count, 0)
      : null,
    buaRange: sizeRange(plain.unitTypes.map((unit) => unit.bua)),
    plotSizeRange: sizeRange(plain.unitTypes.map((unit) => unit.plotSize)),
    coverImageUrl: plain.attachments[0]?.url ?? null,
  }
}

export async function getProjectsForDashboard(
  filters: Partial<DashboardFilters> = {}
): Promise<ProjectCard[]> {
  const where: Prisma.ProjectWhereInput = {}

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { developer: { contains: filters.q, mode: "insensitive" } },
      { location: { contains: filters.q, mode: "insensitive" } },
      { community: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
    ]
  }
  if (filters.developers?.length) where.developer = { in: filters.developers }
  if (filters.communities?.length) where.community = { in: filters.communities }
  if (filters.cities?.length) where.city = { in: filters.cities }
  if (filters.statuses?.length) where.status = { in: filters.statuses }
  if (filters.paymentPlans?.length)
    where.paymentPlan = { in: filters.paymentPlans }
  if (filters.waterfront) where.waterfront = true
  if (filters.golf) where.golf = true
  if (filters.brandedResidence) where.brandedResidence = true
  if (filters.onlyAvailable) where.availableUnitsCount = { gt: 0 }
  if (filters.promotionActive) {
    where.AND = [
      {
        OR: [
          { promoPaymentPlan: { not: null } },
          { promoDownPaymentPercent: { not: null } },
          { promotionNotes: { not: null } },
        ],
      },
    ]
  }
  if (filters.minYear != null || filters.maxYear != null) {
    where.handoverDate = {
      ...(filters.minYear != null
        ? { gte: new Date(filters.minYear, 0, 1) }
        : {}),
      ...(filters.maxYear != null
        ? { lte: new Date(filters.maxYear, 11, 31) }
        : {}),
    }
  }
  if (filters.propertyTypes?.length || filters.bedrooms?.length) {
    where.unitTypes = {
      some: {
        AND: [
          filters.propertyTypes?.length
            ? { propertyType: { in: filters.propertyTypes } }
            : {},
          filters.bedrooms?.length
            ? {
                OR: filters.bedrooms.map((count) =>
                  count >= 5 ? { bedrooms: { gte: 5 } } : { bedrooms: count }
                ),
              }
            : {},
        ],
      },
    }
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      unitTypes: true,
      attachments: {
        where: { category: "IMAGE" },
        orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }],
        take: 1,
      },
    },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
  })

  const cards = projects.map((project) =>
    withCardFields(toPlainProject(project))
  )

  if (filters.minPrice == null && filters.maxPrice == null) {
    return cards
  }

  return cards.filter((project) =>
    project.unitTypes.some((unit) => {
      if (filters.minPrice != null && unit.startingPrice < filters.minPrice)
        return false
      if (filters.maxPrice != null && unit.startingPrice > filters.maxPrice)
        return false
      return true
    })
  )
}

export async function getProjectDetail(
  id: string
): Promise<PlainProject | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      unitTypes: { orderBy: { startingPrice: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      attachments: { orderBy: { uploadedAt: "desc" } },
      paymentMilestones: { orderBy: { sortOrder: "asc" } },
    },
  })

  return project ? toPlainProject(project) : null
}

export async function getFavoriteProjects(): Promise<ProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: { isFavorite: true },
    include: {
      unitTypes: true,
      attachments: {
        where: { category: "IMAGE" },
        orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }],
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return projects.map((project) => withCardFields(toPlainProject(project)))
}

export async function getFilterOptions() {
  const [developers, communities, cities, paymentPlans] = await Promise.all([
    prisma.project.findMany({
      distinct: ["developer"],
      select: { developer: true },
      orderBy: { developer: "asc" },
    }),
    prisma.project.findMany({
      distinct: ["community"],
      where: { community: { not: null } },
      select: { community: true },
      orderBy: { community: "asc" },
    }),
    prisma.project.findMany({
      distinct: ["city"],
      where: { city: { not: null } },
      select: { city: true },
      orderBy: { city: "asc" },
    }),
    prisma.project.findMany({
      distinct: ["paymentPlan"],
      where: { paymentPlan: { not: null } },
      select: { paymentPlan: true },
      orderBy: { paymentPlan: "asc" },
    }),
  ])

  return {
    developers: developers.map((d) => d.developer),
    communities: communities.map((c) => c.community!),
    cities: cities.map((c) => c.city!),
    paymentPlans: paymentPlans.map((p) => p.paymentPlan!),
  }
}
