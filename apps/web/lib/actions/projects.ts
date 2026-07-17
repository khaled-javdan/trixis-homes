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
import { requireAdmin } from "@/lib/auth"
import { geocodeLocation } from "@/lib/geocode"

export async function getMasterCommunityNames(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    distinct: ["masterCommunity"],
    where: { masterCommunity: { not: null } },
    select: { masterCommunity: true },
    orderBy: { masterCommunity: "asc" },
  })
  return rows.map((row) => row.masterCommunity!)
}

export async function createProject(input: ProjectInput) {
  await requireAdmin()
  const project = await prisma.project.create({
    data: await toProjectData(input),
  })
  revalidatePath("/")
  return { id: project.id }
}

export async function updateProject(id: string, input: ProjectInput) {
  await requireAdmin()
  await prisma.project.update({
    where: { id },
    data: await toProjectData(input),
  })
  revalidatePath("/")
  revalidatePath(`/projects/${id}`)
}

export async function deleteProject(id: string) {
  await requireAdmin()
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
  await requireAdmin()
  await prisma.project.update({ where: { id }, data: { isFavorite } })
  revalidatePath("/")
  revalidatePath(`/projects/${id}`)
}

function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Publishes/unpublishes a project on the public marketing site. The slug is
 * generated on first publish and then kept stable so public URLs don't break
 * across unpublish/republish cycles. */
export async function setProjectPublished(id: string, isPublished: boolean) {
  await requireAdmin()
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true, slug: true },
  })
  if (!project) throw new Error("Project not found")

  let slug = project.slug
  if (isPublished && !slug) {
    const base = slugify(project.name) || id
    slug = base
    for (let suffix = 2; ; suffix += 1) {
      const taken = await prisma.project.findUnique({
        where: { slug },
        select: { id: true },
      })
      if (!taken || taken.id === id) break
      slug = `${base}-${suffix}`
    }
  }

  await prisma.project.update({
    where: { id },
    // Unpublishing also pulls the project from the home-page slider.
    data: { isPublished, slug, ...(isPublished ? {} : { isHot: false }) },
  })
  revalidatePath(`/projects/${id}`)
  return { slug }
}

/** Features/unfeatures a published project in the marketing home-page
 * "hot projects" slider. */
export async function setProjectHot(id: string, isHot: boolean) {
  await requireAdmin()
  if (isHot) {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { isPublished: true },
    })
    if (!project) throw new Error("Project not found")
    if (!project.isPublished) {
      throw new Error("Publish the project before featuring it")
    }
  }
  await prisma.project.update({ where: { id }, data: { isHot } })
  revalidatePath(`/projects/${id}`)
}

export async function setProjectCoordinates(
  id: string,
  latitude: number,
  longitude: number
) {
  await requireAdmin()
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid coordinates")
  }
  await prisma.project.update({
    where: { id },
    data: { latitude, longitude },
  })
  revalidatePath(`/projects/${id}`)
}

export async function duplicateProject(id: string) {
  await requireAdmin()
  const project = await prisma.project.findUnique({
    where: { id },
    include: { unitTypes: true, paymentMilestones: true },
  })
  if (!project) throw new Error("Project not found")

  const copy = await prisma.project.create({
    data: {
      name: `${project.name} (Copy)`,
      developer: project.developer,
      masterCommunity: project.masterCommunity,
      community: project.community,
      city: project.city,
      location: project.location,
      latitude: project.latitude,
      longitude: project.longitude,
      status: project.status,
      launchDate: project.launchDate,
      handoverDate: project.handoverDate,
      description: project.description,
      paymentPlan: project.paymentPlan,
      downPaymentPercent: project.downPaymentPercent,
      promoPaymentPlan: project.promoPaymentPlan,
      promoDownPaymentPercent: project.promoDownPaymentPercent,
      promotionNotes: project.promotionNotes,
      serviceCharge: project.serviceCharge,
      amenities: project.amenities,
      sellingPoints: project.sellingPoints,
      investmentRating: project.investmentRating,
      luxuryRating: project.luxuryRating,
      familyRating: project.familyRating,
      waterfront: project.waterfront,
      golf: project.golf,
      brandedResidence: project.brandedResidence,
      brandName: project.brandName,
      availableUnitsCount: project.availableUnitsCount,
      link: project.link,
      isFavorite: false,
      unitTypes: {
        create: project.unitTypes.map((unit) => ({
          propertyType: unit.propertyType,
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
          serviceCharge: unit.serviceCharge,
          notes: unit.notes,
          listingUrl: unit.listingUrl,
        })),
      },
      paymentMilestones: {
        create: project.paymentMilestones.map((milestone) => ({
          label: milestone.label,
          percentage: milestone.percentage,
          date: milestone.date,
          note: milestone.note,
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
    include: { unitTypes: true, notes: true, paymentMilestones: true },
  })
  if (!project) throw new Error("Project not found")

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      developer: project.developer,
      masterCommunity: project.masterCommunity,
      community: project.community,
      city: project.city,
      location: project.location,
      status: project.status,
      launchDate: project.launchDate,
      handoverDate: project.handoverDate,
      description: project.description,
      paymentPlan: project.paymentPlan,
      downPaymentPercent: project.downPaymentPercent
        ? project.downPaymentPercent.toNumber()
        : null,
      promoPaymentPlan: project.promoPaymentPlan,
      promoDownPaymentPercent: project.promoDownPaymentPercent
        ? project.promoDownPaymentPercent.toNumber()
        : null,
      promotionNotes: project.promotionNotes,
      serviceCharge: project.serviceCharge
        ? project.serviceCharge.toNumber()
        : null,
      amenities: project.amenities,
      sellingPoints: project.sellingPoints,
      investmentRating: project.investmentRating,
      luxuryRating: project.luxuryRating,
      familyRating: project.familyRating,
      waterfront: project.waterfront,
      golf: project.golf,
      brandedResidence: project.brandedResidence,
      brandName: project.brandName,
      availableUnitsCount: project.availableUnitsCount,
      link: project.link,
      isFavorite: project.isFavorite,
      unitTypes: project.unitTypes.map((unit) => ({
        propertyType: unit.propertyType,
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
        serviceCharge: unit.serviceCharge ? unit.serviceCharge.toNumber() : null,
        notes: unit.notes,
        listingUrl: unit.listingUrl,
      })),
      notes: project.notes.map((note) => ({
        body: note.body,
        createdAt: note.createdAt,
      })),
      paymentMilestones: project.paymentMilestones.map((milestone) => ({
        label: milestone.label,
        percentage: milestone.percentage.toNumber(),
        date: milestone.date,
        note: milestone.note,
      })),
    },
  }
}

export async function importProject(data: unknown) {
  await requireAdmin()
  const parsed = projectExportSchema.parse(data)
  const { project } = parsed
  const coordinates = await geocodeLocation(
    [project.location, project.community, "United Arab Emirates"]
      .filter(Boolean)
      .join(", ")
  )

  const created = await prisma.project.create({
    data: {
      name: project.name,
      developer: project.developer,
      masterCommunity: project.masterCommunity ?? null,
      community: project.community ?? null,
      city: project.city ?? null,
      location: project.location,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      status: project.status,
      launchDate: project.launchDate ?? null,
      handoverDate: project.handoverDate ?? null,
      description: project.description ?? null,
      paymentPlan: project.paymentPlan ?? null,
      downPaymentPercent: project.downPaymentPercent ?? null,
      promoPaymentPlan: project.promoPaymentPlan ?? null,
      promoDownPaymentPercent: project.promoDownPaymentPercent ?? null,
      promotionNotes: project.promotionNotes ?? null,
      serviceCharge: project.serviceCharge ?? null,
      amenities: project.amenities ?? [],
      sellingPoints: project.sellingPoints ?? [],
      investmentRating: project.investmentRating ?? null,
      luxuryRating: project.luxuryRating ?? null,
      familyRating: project.familyRating ?? null,
      waterfront: project.waterfront ?? false,
      golf: project.golf ?? false,
      brandedResidence: project.brandedResidence ?? false,
      brandName: project.brandName ?? null,
      availableUnitsCount: project.availableUnitsCount ?? null,
      link: project.link ?? null,
      isFavorite: false,
      unitTypes: {
        create: project.unitTypes.map((unit) => ({
          propertyType: unit.propertyType,
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
          serviceCharge: unit.serviceCharge ?? null,
          notes: unit.notes ?? null,
          listingUrl: unit.listingUrl ?? null,
        })),
      },
      notes: {
        create: project.notes.map((note) => ({ body: note.body })),
      },
      paymentMilestones: {
        create: (project.paymentMilestones ?? []).map((milestone) => ({
          label: milestone.label,
          percentage: milestone.percentage,
          date: milestone.date,
          note: milestone.note ?? null,
        })),
      },
    },
  })

  revalidatePath("/")
  return { id: created.id }
}
