"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import {
  projectExportSchema,
  type ProjectExport,
} from "@workspace/db/validation/export"
import type { ProjectInput } from "@workspace/db/validation/project"

import { toProjectData } from "@/lib/actions/prisma-mappers"

export async function createProject(input: ProjectInput) {
  const project = await prisma.project.create({ data: toProjectData(input) })
  revalidatePath("/")
  return { id: project.id }
}

export async function updateProject(id: string, input: ProjectInput) {
  await prisma.project.update({ where: { id }, data: toProjectData(input) })
  revalidatePath("/")
  revalidatePath(`/projects/${id}`)
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { attachments: true },
  })
  if (!project) return

  for (const attachment of project.attachments) {
    try {
      await del(attachment.url)
    } catch (error) {
      console.error(
        `Failed to delete blob for attachment ${attachment.id}:`,
        error
      )
    }
  }

  await prisma.project.delete({ where: { id } })
  revalidatePath("/")
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  await prisma.project.update({ where: { id }, data: { isFavorite } })
  revalidatePath("/")
  revalidatePath(`/projects/${id}`)
}

export async function duplicateProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { unitTypes: true },
  })
  if (!project) throw new Error("Project not found")

  const copy = await prisma.project.create({
    data: {
      name: `${project.name} (Copy)`,
      developer: project.developer,
      community: project.community,
      location: project.location,
      status: project.status,
      handoverDate: project.handoverDate,
      description: project.description,
      paymentPlan: project.paymentPlan,
      isFavorite: false,
      unitTypes: {
        create: project.unitTypes.map((unit) => ({
          category: unit.category,
          label: unit.label,
          unitCount: unit.unitCount,
          startingPrice: unit.startingPrice,
          size: unit.size,
          plotSize: unit.plotSize,
          bua: unit.bua,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          parking: unit.parking,
          paymentPlan: unit.paymentPlan,
          notes: unit.notes,
        })),
      },
    },
  })

  revalidatePath("/")
  return { id: copy.id }
}

export async function exportProject(id: string): Promise<ProjectExport> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { unitTypes: true, notes: true },
  })
  if (!project) throw new Error("Project not found")

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      developer: project.developer,
      community: project.community,
      location: project.location,
      status: project.status,
      handoverDate: project.handoverDate,
      description: project.description,
      paymentPlan: project.paymentPlan,
      isFavorite: project.isFavorite,
      unitTypes: project.unitTypes.map((unit) => ({
        category: unit.category,
        label: unit.label,
        unitCount: unit.unitCount,
        startingPrice: unit.startingPrice.toNumber(),
        size: unit.size ? unit.size.toNumber() : null,
        plotSize: unit.plotSize ? unit.plotSize.toNumber() : null,
        bua: unit.bua ? unit.bua.toNumber() : null,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        parking: unit.parking,
        paymentPlan: unit.paymentPlan,
        notes: unit.notes,
      })),
      notes: project.notes.map((note) => ({
        body: note.body,
        createdAt: note.createdAt,
      })),
    },
  }
}

export async function importProject(data: unknown) {
  const parsed = projectExportSchema.parse(data)
  const { project } = parsed

  const created = await prisma.project.create({
    data: {
      name: project.name,
      developer: project.developer,
      community: project.community ?? null,
      location: project.location,
      status: project.status,
      handoverDate: project.handoverDate ?? null,
      description: project.description ?? null,
      paymentPlan: project.paymentPlan ?? null,
      isFavorite: false,
      unitTypes: {
        create: project.unitTypes.map((unit) => ({
          category: unit.category,
          label: unit.label ?? null,
          unitCount: unit.unitCount ?? null,
          startingPrice: unit.startingPrice,
          size: unit.size ?? null,
          plotSize: unit.plotSize ?? null,
          bua: unit.bua ?? null,
          bedrooms: unit.bedrooms ?? null,
          bathrooms: unit.bathrooms ?? null,
          parking: unit.parking ?? null,
          paymentPlan: unit.paymentPlan ?? null,
          notes: unit.notes ?? null,
        })),
      },
      notes: {
        create: project.notes.map((note) => ({ body: note.body })),
      },
    },
  })

  revalidatePath("/")
  return { id: created.id }
}
