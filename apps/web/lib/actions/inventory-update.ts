"use server"

import { generateText, NoObjectGeneratedError, Output } from "ai"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import {
  inventoryExtractedProjectSchema,
  inventoryExtractionResultSchema,
  inventoryProjectPatchSchema,
  inventoryUnitTypePatchSchema,
  type InventoryExtractedProject,
  type InventoryProjectPatch,
  type InventoryUnitTypePatch,
} from "@workspace/db/validation/inventory-update"
import type { UnitTypeInput } from "@workspace/db/validation/unit-type"

import { toUnitTypeData } from "@/lib/actions/prisma-mappers"
import { requireAdmin } from "@/lib/auth"
import {
  buildProjectDiff,
  matchProject,
  type InventoryProjectMatch,
} from "@/lib/inventory-diff"
import { toPlainProject } from "@/lib/data/serialize"

const SYSTEM_PROMPT = `You extract an inventory/availability update from a UAE
developer availability sheet — pasted text (often a WhatsApp message) or an
image (screenshot or photo of an availability/price table). The sheet updates
EXISTING projects in a brokerage database: extract only what the sheet states,
and use null for anything it doesn't mention — never invent or carry over a
value. The input may cover one project or several back to back — split them
into separate entries in "projects".

Rules:
- Copy the project name and developer exactly as written (matching against the
  database happens downstream). Use null if not stated.
- Prices are in AED. Shorthand like "1.85m" or "2m" means 1,850,000 / 2,000,000.
  A bare number in the same price list/column as "m"-suffixed prices (e.g. "2.4"
  next to "1.85m" and "3.3m") is at the same order of magnitude — treat it as
  millions too (2.4 -> 2,400,000).
- A payment plan is usually written as a ratio like "55/45", "50/50pp", "60/40" —
  put the raw ratio (e.g. "55/45") in paymentPlan. A down payment written as
  "X% DP" or "X% down payment" next to that ratio goes in downPaymentPercent as
  a plain number (e.g. "15% DP" -> 15).
- A second, limited-time plan labeled "Promotion"/"Promo" goes in
  promoPaymentPlan / promoDownPaymentPercent. Leave both null if only one plan
  is given.
- Sales incentives that aren't a payment plan — registration/ADM fee waivers,
  broker commission, and similar (e.g. "2% ADM Waiver", "5% Broker
  Commission") — go in promotionNotes as short readable text. Null if none.
- A service charge written as "AED X/sq.ft" or "X/sqft" -> plain number in the
  project's serviceCharge. Only set a unit type's own serviceCharge when the
  sheet gives a different figure for that specific unit type or building.
- In an availability sheet, a per-unit-type quantity (e.g. "122 | 1.85m",
  "12 units left", "only 3 remaining") means units AVAILABLE for that type —
  put it in that unit type's unitCount. "SOLD OUT" next to a unit type ->
  unitCount 0. A project-wide available/remaining total goes in
  availableUnitsCount.
- Infer propertyType from context: "townhouse" -> TOWNHOUSE, "villa" -> VILLA,
  "penthouse" -> PENTHOUSE, "duplex" -> DUPLEX, "office" -> OFFICE, "retail" ->
  RETAIL; plain "Nbd"/"N bed" listings with no other keyword -> APARTMENT.
  Always also fill the numeric bedrooms field (0 for a studio).
- Give each unit type a short human label, e.g. "1BR", "2BR Mid Townhouse".
- Convert relative handover dates to an ISO date (YYYY-MM-DD) using the last
  day of the period: "Q4 2030" -> 2030-12-31, "2029" -> 2029-12-31. Null if the
  sheet gives no handover info.
- status only when explicitly stated: ready/handed over -> READY, under
  construction -> UNDER_CONSTRUCTION, off-plan/new launch -> OFF_PLAN.
  Otherwise null.`

// Some models occasionally double-encode the nested "projects" array as a JSON
// string instead of a real array, which fails the SDK's own schema validation.
// Recover by re-parsing the raw text before giving up (mirrors ai-import.ts).
function repairDoubleEncodedProjects(
  text: string
): InventoryExtractedProject[] | null {
  try {
    const parsed: unknown = JSON.parse(text)
    const projects =
      typeof (parsed as { projects?: unknown }).projects === "string"
        ? (JSON.parse((parsed as { projects: string }).projects) as unknown as {
            projects: unknown
          }).projects
        : (parsed as { projects?: unknown }).projects
    return inventoryExtractionResultSchema.parse({ projects }).projects
  } catch {
    return null
  }
}

async function buildMatch(
  extracted: InventoryExtractedProject,
  match: { id: string; confidence: "exact" | "fuzzy" } | null
): Promise<InventoryProjectMatch> {
  if (!match) {
    return {
      extracted,
      match: null,
      fieldChanges: [],
      unitTypeDiffs: [],
      newUnitTypes: [],
    }
  }
  const project = await prisma.project.findUnique({
    where: { id: match.id },
    include: { unitTypes: true },
  })
  if (!project) {
    return {
      extracted,
      match: null,
      fieldChanges: [],
      unitTypeDiffs: [],
      newUnitTypes: [],
    }
  }
  const plain = toPlainProject(project)
  return {
    extracted,
    match: {
      projectId: project.id,
      projectName: project.name,
      developer: project.developer,
      confidence: match.confidence,
    },
    ...buildProjectDiff(extracted, plain),
  }
}

export async function extractInventoryUpdate(input: {
  text?: string
  imageDataUrl?: string
}): Promise<InventoryProjectMatch[]> {
  await requireAdmin()
  const text = input.text?.trim()
  if (!text && !input.imageDataUrl) return []

  let extracted: InventoryExtractedProject[]
  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      system: SYSTEM_PROMPT,
      output: Output.object({ schema: inventoryExtractionResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                text || "Extract the availability update from this image.",
            },
            ...(input.imageDataUrl
              ? [{ type: "image" as const, image: input.imageDataUrl }]
              : []),
          ],
        },
      ],
    })
    extracted = output.projects
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const repaired = repairDoubleEncodedProjects(error.text)
      if (repaired) {
        extracted = repaired
      } else {
        throw error
      }
    } else {
      throw error
    }
  }

  if (extracted.length === 0) return []

  const candidates = await prisma.project.findMany({
    select: { id: true, name: true, developer: true },
  })

  return Promise.all(
    extracted.map((project) =>
      buildMatch(project, matchProject(project, candidates))
    )
  )
}

export async function rematchInventoryProject(
  extracted: InventoryExtractedProject,
  projectId: string
): Promise<InventoryProjectMatch> {
  await requireAdmin()
  const parsed = inventoryExtractedProjectSchema.parse(extracted)
  return buildMatch(parsed, { id: projectId, confidence: "exact" })
}

export type ApplyInventoryProjectInput = {
  projectId: string
  projectPatch: InventoryProjectPatch
  unitTypePatches: { unitTypeId: string; patch: InventoryUnitTypePatch }[]
  newUnitTypes: UnitTypeInput[]
}

export async function applyInventoryUpdates(
  projects: ApplyInventoryProjectInput[]
): Promise<{ updatedProjects: number; createdUnitTypes: number }> {
  await requireAdmin()
  let updatedProjects = 0
  let createdUnitTypes = 0

  for (const entry of projects) {
    const projectPatch = inventoryProjectPatchSchema.parse(entry.projectPatch)
    const unitTypePatches = entry.unitTypePatches.map((unitPatch) => ({
      unitTypeId: unitPatch.unitTypeId,
      patch: inventoryUnitTypePatchSchema.parse(unitPatch.patch),
    }))

    const project = await prisma.project.findUnique({
      where: { id: entry.projectId },
      select: { id: true, unitTypes: { select: { id: true } } },
    })
    if (!project) throw new Error("Project not found")
    const ownedUnitIds = new Set(project.unitTypes.map((unit) => unit.id))
    for (const unitPatch of unitTypePatches) {
      if (!ownedUnitIds.has(unitPatch.unitTypeId)) {
        throw new Error("Unit type does not belong to the project")
      }
    }

    const { handoverDate, ...scalarPatch } = projectPatch
    await prisma.$transaction([
      prisma.project.update({
        where: { id: entry.projectId },
        data: {
          ...scalarPatch,
          ...(handoverDate !== undefined
            ? { handoverDate: handoverDate ? new Date(handoverDate) : null }
            : {}),
          inventoryUpdatedAt: new Date(),
        },
      }),
      ...unitTypePatches.map((unitPatch) =>
        prisma.unitType.update({
          where: { id: unitPatch.unitTypeId },
          data: unitPatch.patch,
        })
      ),
      ...entry.newUnitTypes.map((unit) =>
        prisma.unitType.create({
          data: { ...toUnitTypeData(unit), projectId: entry.projectId },
        })
      ),
    ])

    updatedProjects += 1
    createdUnitTypes += entry.newUnitTypes.length
    revalidatePath(`/projects/${entry.projectId}`)
  }

  revalidatePath("/")
  return { updatedProjects, createdUnitTypes }
}
