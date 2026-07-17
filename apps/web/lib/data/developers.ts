import "server-only"

import { prisma } from "@workspace/db"

export type DeveloperRow = {
  id: string
  name: string
  description: string | null
  coverImageUrl: string | null
  logoUrl: string | null
  websiteUrl: string | null
  isVisible: boolean
  projectCount: number
  updatedAt: string
}

export async function getDevelopersForAdmin(): Promise<DeveloperRow[]> {
  const [developers, projectCounts] = await Promise.all([
    prisma.developer.findMany({ orderBy: { name: "asc" } }),
    prisma.project.groupBy({ by: ["developer"], _count: { _all: true } }),
  ])

  return developers.map((developer) => {
    const name = developer.name.toLowerCase()
    const projectCount = projectCounts
      .filter((group) => {
        const candidate = group.developer.toLowerCase()
        return candidate.includes(name) || name.includes(candidate)
      })
      .reduce((sum, group) => sum + group._count._all, 0)

    return {
      id: developer.id,
      name: developer.name,
      description: developer.description,
      coverImageUrl: developer.coverImageUrl,
      logoUrl: developer.logoUrl,
      websiteUrl: developer.websiteUrl,
      isVisible: developer.isVisible,
      projectCount,
      updatedAt: developer.updatedAt.toISOString(),
    }
  })
}
