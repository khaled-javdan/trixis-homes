import "server-only"

import { prisma, type Prisma, type ProjectStatus } from "@workspace/db"

import { toPlainProject, type PlainProject } from "./serialize"

export type DashboardFilters = {
  q?: string
  developer?: string
  location?: string
  status?: ProjectStatus
  minPrice?: number
  maxPrice?: number
}

export type ProjectCard = PlainProject & {
  startingPrice: number | null
  unitTypeCount: number
  coverImageUrl: string | null
}

function withCardFields(
  plain: PlainProject & { attachments: PlainProject["attachments"] }
): ProjectCard {
  const prices = plain.unitTypes.map((unit) => unit.startingPrice)
  return {
    ...plain,
    startingPrice: prices.length ? Math.min(...prices) : null,
    unitTypeCount: plain.unitTypes.length,
    coverImageUrl: plain.attachments[0]?.url ?? null,
  }
}

export async function getProjectsForDashboard(
  filters: DashboardFilters = {}
): Promise<ProjectCard[]> {
  const where: Prisma.ProjectWhereInput = {}

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { developer: { contains: filters.q, mode: "insensitive" } },
      { location: { contains: filters.q, mode: "insensitive" } },
      { community: { contains: filters.q, mode: "insensitive" } },
    ]
  }
  if (filters.developer) where.developer = filters.developer
  if (filters.location) where.location = filters.location
  if (filters.status) where.status = filters.status

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
    },
  })

  return project ? toPlainProject(project) : null
}

export async function getDashboardStats() {
  const [totalProjects, totalUnitTypes, favoriteProjects, latest] =
    await Promise.all([
      prisma.project.count(),
      prisma.unitType.count(),
      prisma.project.count({ where: { isFavorite: true } }),
      prisma.project.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ])

  return {
    totalProjects,
    totalUnitTypes,
    favoriteProjects,
    lastUpdated: latest ? latest.updatedAt.toISOString() : null,
  }
}

export async function getFilterOptions() {
  const [developers, locations] = await Promise.all([
    prisma.project.findMany({
      distinct: ["developer"],
      select: { developer: true },
      orderBy: { developer: "asc" },
    }),
    prisma.project.findMany({
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    }),
  ])

  return {
    developers: developers.map((d) => d.developer),
    locations: locations.map((l) => l.location),
  }
}
