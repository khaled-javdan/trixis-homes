"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import {
  developerSchema,
  type DeveloperInput,
} from "@workspace/db/validation/developer"

import { requireAdmin } from "@/lib/auth"

// Developer rows and Project.developer strings are matched loosely
// ("Aldar" ↔ "Aldar Properties"), mirroring the public site's matching.
function looseMatch(a: string, b: string): boolean {
  const left = a.toLowerCase()
  const right = b.toLowerCase()
  return left.includes(right) || right.includes(left)
}

/** Creates Developer rows for any project developer that doesn't loosely
 * match an existing row, so newly imported projects show up in the
 * configuration page without manual entry. */
export async function syncDevelopersFromProjects() {
  await requireAdmin()
  const [existing, projectDevelopers] = await Promise.all([
    prisma.developer.findMany({ select: { name: true } }),
    prisma.project.findMany({
      distinct: ["developer"],
      select: { developer: true },
    }),
  ])

  const known = existing.map((developer) => developer.name)
  const missing = projectDevelopers
    .map((project) => project.developer)
    .filter((name) => !known.some((existingName) => looseMatch(existingName, name)))

  if (missing.length) {
    await prisma.developer.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    })
  }
}

export async function updateDeveloper(id: string, input: DeveloperInput) {
  await requireAdmin()
  const parsed = developerSchema.parse(input)
  const existing = await prisma.developer.findUnique({ where: { id } })
  if (!existing) throw new Error("Developer not found")

  await prisma.developer.update({
    where: { id },
    data: {
      name: parsed.name,
      description: parsed.description ?? null,
      coverImageUrl: parsed.coverImageUrl ?? null,
      logoUrl: parsed.logoUrl ?? null,
      websiteUrl: parsed.websiteUrl ?? null,
    },
  })

  // A replaced or removed cover that lives in our blob store is deleted so
  // storage doesn't accumulate orphans.
  if (
    existing.coverImageUrl &&
    existing.coverImageUrl !== (parsed.coverImageUrl ?? null) &&
    existing.coverImageUrl.includes(".blob.vercel-storage.com/")
  ) {
    try {
      await del(existing.coverImageUrl)
    } catch (error) {
      console.error(`Failed to delete old cover for developer ${id}:`, error)
    }
  }

  revalidatePath("/developers")
}

export async function setDeveloperVisibility(id: string, isVisible: boolean) {
  await requireAdmin()
  await prisma.developer.update({ where: { id }, data: { isVisible } })
  revalidatePath("/developers")
}

/** Deletes a developer's editorial row (and its uploaded cover). Note:
 * developers still attached to projects are re-created (blank) by the next
 * sync — hide them instead if the goal is to keep them off the site. */
export async function deleteDeveloper(id: string) {
  await requireAdmin()
  const developer = await prisma.developer.findUnique({ where: { id } })
  if (!developer) return

  if (developer.coverImageUrl?.includes(".blob.vercel-storage.com/")) {
    try {
      await del(developer.coverImageUrl)
    } catch (error) {
      console.error(`Failed to delete cover for developer ${id}:`, error)
    }
  }

  await prisma.developer.delete({ where: { id } })
  revalidatePath("/developers")
}
