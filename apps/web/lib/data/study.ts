import "server-only"

import { prisma } from "@workspace/db"

import { toPlainProject, type PlainProject } from "./serialize"

export async function getProjectsForStudyMode(
  projectId?: string
): Promise<PlainProject[]> {
  const projects = await prisma.project.findMany({
    where: projectId ? { id: projectId } : undefined,
    include: {
      unitTypes: { orderBy: { startingPrice: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      attachments: {
        where: { category: "IMAGE" },
        orderBy: { uploadedAt: "asc" },
        take: 1,
      },
    },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  })

  return projects.map(toPlainProject)
}

export async function getProjectPickerOptions() {
  return prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  })
}
