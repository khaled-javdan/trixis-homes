"use server"

import { generateText, NoObjectGeneratedError, Output } from "ai"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import { extractionResultSchema } from "@workspace/db/validation/ai-import"
import type { ExtractedProject } from "@workspace/db/validation/ai-import"
import type { ProjectInput } from "@workspace/db/validation/project"
import type { UnitTypeInput } from "@workspace/db/validation/unit-type"

import { toProjectData, toUnitTypeData } from "@/lib/actions/prisma-mappers"

const SYSTEM_PROMPT = `You extract real estate project listings from raw, informally
formatted text (broker notes, WhatsApp messages, price lists) for a UAE property
brokerage. The input may describe one project or several projects back to back —
split it into separate entries in "projects".

Rules:
- Prices are in AED. Shorthand like "1.85m" or "2m" means 1,850,000 / 2,000,000.
  A bare number in the same price list/column as "m"-suffixed prices (e.g. "2.4"
  next to "1.85m" and "3.3m") is at the same order of magnitude — treat it as
  millions too (2.4 -> 2,400,000).
- A payment plan is usually written as a ratio like "55/45", "50/50pp", "60/40" —
  put the raw ratio (e.g. "55/45") in the project's paymentPlan field.
- Per-unit-type quantities appear before a price or after a dash/pipe (e.g.
  "122 | 1.85m", "122 units"). Put that number in unitCount. A project-wide total
  (e.g. "354 Units") does not need to exactly equal the sum of unitCount values.
- Infer the unit category from context: "townhouse" -> TOWNHOUSE, "villa" -> VILLA,
  "studio" -> STUDIO, "penthouse" -> PENTHOUSE, "duplex" -> DUPLEX, "office" ->
  OFFICE, "retail" -> RETAIL. Plain "Nbd"/"N bed" apartment listings with no other
  keyword -> ONE_BR/TWO_BR/THREE_BR/FOUR_BR/FIVE_BR_PLUS based on N. Always also
  fill the numeric "bedrooms" field regardless of category.
- Give each unit type a short human label, e.g. "2BR Mid Townhouse", "4BR
  Standalone Villa", "1BR".
- Convert relative handover dates to an ISO date (YYYY-MM-DD) using the last day
  of the period: "Q4 2030" -> 2030-12-31, "Q1 2031" -> 2031-03-31, "2029" ->
  2029-12-31. If no handover info is given, use null.
- status defaults to OFF_PLAN unless the text says the project is ready/completed
  (READY) or under construction (UNDER_CONSTRUCTION).
- Put any extra context that doesn't fit a structured field (e.g. nearby schools,
  amenities, notes) into description.
- Only fill name/developer/location/community when the text actually states them.
  Never invent a value — leave it null so a human can fill it in later.`

// Some models occasionally double-encode the nested "projects" array as a JSON
// string instead of a real array, which fails the SDK's own schema validation.
// Recover by re-parsing the raw text before giving up.
function repairDoubleEncodedProjects(text: string): ExtractedProject[] | null {
  try {
    const parsed: unknown = JSON.parse(text)
    const projects =
      typeof (parsed as { projects?: unknown }).projects === "string"
        ? (JSON.parse((parsed as { projects: string }).projects) as unknown as {
            projects: unknown
          }).projects
        : (parsed as { projects?: unknown }).projects
    return extractionResultSchema.parse({ projects }).projects
  } catch {
    return null
  }
}

export async function extractProjectsFromText(
  text: string
): Promise<ExtractedProject[]> {
  const trimmed = text.trim()
  if (!trimmed) return []

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      system: SYSTEM_PROMPT,
      output: Output.object({ schema: extractionResultSchema }),
      prompt: trimmed,
    })

    return output.projects
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const repaired = repairDoubleEncodedProjects(error.text)
      if (repaired) return repaired
    }
    throw error
  }
}

export async function createProjectsFromExtraction(
  drafts: { project: ProjectInput; unitTypes: UnitTypeInput[] }[]
): Promise<{ id: string }[]> {
  const created: { id: string }[] = []

  for (const draft of drafts) {
    const project = await prisma.project.create({
      data: {
        ...toProjectData(draft.project),
        unitTypes: { create: draft.unitTypes.map(toUnitTypeData) },
      },
    })
    created.push({ id: project.id })
  }

  revalidatePath("/")
  return created
}
