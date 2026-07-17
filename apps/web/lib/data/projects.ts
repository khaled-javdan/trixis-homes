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

export type ProjectGroup = {
  masterCommunity: string | null
  projects: ProjectCard[]
}

// Buckets already-fetched dashboard cards by masterCommunity, without a
// separate query — groups sorted alphabetically, ungrouped projects (no
// masterCommunity set) collected in a trailing null-keyed bucket.
export function groupProjectsByMasterCommunity(
  projects: ProjectCard[]
): ProjectGroup[] {
  const grouped = new Map<string, ProjectCard[]>()
  const ungrouped: ProjectCard[] = []

  for (const project of projects) {
    if (!project.masterCommunity) {
      ungrouped.push(project)
      continue
    }
    const existing = grouped.get(project.masterCommunity)
    if (existing) {
      existing.push(project)
    } else {
      grouped.set(project.masterCommunity, [project])
    }
  }

  const groups: ProjectGroup[] = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([masterCommunity, groupProjects]) => ({
      masterCommunity,
      projects: groupProjects,
    }))

  if (ungrouped.length) {
    groups.push({ masterCommunity: null, projects: ungrouped })
  }

  return groups
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
      paymentMilestones: { orderBy: { date: "asc" } },
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

export async function getProjectPickerOptions() {
  return prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  })
}

export type MasterCommunityCard = {
  name: string
  projectCount: number
  city: string | null
  coverImageUrl: string | null
}

export async function getMasterCommunities(): Promise<MasterCommunityCard[]> {
  const projects = await prisma.project.findMany({
    where: { masterCommunity: { not: null } },
    select: {
      masterCommunity: true,
      city: true,
      attachments: {
        where: { category: "IMAGE" },
        orderBy: [{ isCover: "desc" }, { uploadedAt: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  })

  const grouped = new Map<string, MasterCommunityCard>()
  for (const project of projects) {
    const name = project.masterCommunity!
    const existing = grouped.get(name)
    if (existing) {
      existing.projectCount += 1
      if (!existing.coverImageUrl && project.attachments[0]) {
        existing.coverImageUrl = project.attachments[0].url
      }
    } else {
      grouped.set(name, {
        name,
        projectCount: 1,
        city: project.city,
        coverImageUrl: project.attachments[0]?.url ?? null,
      })
    }
  }

  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export async function getProjectsByMasterCommunity(
  masterCommunity: string
): Promise<ProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: { masterCommunity },
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

  return projects.map((project) => withCardFields(toPlainProject(project)))
}

export type ProjectMatchOption = {
  id: string
  name: string
  developer: string
}

export async function getProjectMatchOptions(): Promise<ProjectMatchOption[]> {
  return prisma.project.findMany({
    select: { id: true, name: true, developer: true },
    orderBy: { name: "asc" },
  })
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
