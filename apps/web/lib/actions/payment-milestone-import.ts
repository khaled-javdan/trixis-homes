"use server"

import { generateText, NoObjectGeneratedError, Output } from "ai"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import {
  paymentMilestoneExtractionResultSchema,
  type ExtractedPaymentMilestone,
  type PaymentMilestoneInput,
} from "@workspace/db/validation/payment-milestone"

import { toPaymentMilestoneData } from "@/lib/actions/prisma-mappers"

const BASE_SYSTEM_PROMPT = `You extract a structured payment milestone breakdown from a UAE real
estate payment plan — a developer's payment schedule table, price list, or broker's
description of it. The input may be pasted text or an image (a screenshot or photo of a
payment plan table or brochure page).

Rules:
- Each installment/row becomes one entry in "milestones", in the same order they appear
  (top to bottom in a table, or in reading order in prose).
- percentage is the percent of the total unit price due at that milestone, as a plain
  number (e.g. "10%" -> 10).
- label is a short name for the installment, e.g. "Booking", "1st Installment", "On
  Handover". If the source doesn't name it, use its position, e.g. "Installment 2".
- date is the calendar date this installment is due, in ISO format (YYYY-MM-DD):
  - If the source gives a specific date, month/year, or quarter, use that (for a quarter,
    use the last day of the quarter: Q1 -> 03-31, Q2 -> 06-30, Q3 -> 09-30, Q4 -> 12-31).
  - If the source phrases it relative to handover ("on handover", "N months after
    handover") and the project's handover date is given below, compute the concrete date
    from that anchor.
  - If the source only says something generic with no date and no handover anchor is
    available (e.g. "during construction" with nothing else to go on), set date to null —
    do not guess.
- note is any extra detail worth keeping about that installment (e.g. "on 30% construction
  completion", "subject to developer's discretion") — otherwise null.
- Extract percentages exactly as shown even if they don't sum to 100 — don't correct or
  invent values.`

// Some models occasionally double-encode the nested "milestones" array as a JSON
// string instead of a real array, which fails the SDK's own schema validation.
// Recover by re-parsing the raw text before giving up (mirrors the same repair
// in ai-import.ts for project extraction).
function repairDoubleEncodedMilestones(
  text: string
): ExtractedPaymentMilestone[] | null {
  try {
    const parsed: unknown = JSON.parse(text)
    const milestones =
      typeof (parsed as { milestones?: unknown }).milestones === "string"
        ? (
            JSON.parse(
              (parsed as { milestones: string }).milestones
            ) as unknown as { milestones: unknown }
          ).milestones
        : (parsed as { milestones?: unknown }).milestones
    return paymentMilestoneExtractionResultSchema.parse({ milestones })
      .milestones
  } catch {
    return null
  }
}

export async function extractPaymentMilestones(input: {
  text?: string
  imageDataUrl?: string
  handoverDate?: string | null
}): Promise<ExtractedPaymentMilestone[]> {
  const text = input.text?.trim()
  if (!text && !input.imageDataUrl) return []

  const system = input.handoverDate
    ? `${BASE_SYSTEM_PROMPT}\n\nThis project's handover date is ${input.handoverDate}. Use it as the anchor for any milestone phrased relative to handover.`
    : BASE_SYSTEM_PROMPT

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      system,
      output: Output.object({
        schema: paymentMilestoneExtractionResultSchema,
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: text || "Extract the payment plan breakdown from this image.",
            },
            ...(input.imageDataUrl
              ? [{ type: "image" as const, image: input.imageDataUrl }]
              : []),
          ],
        },
      ],
    })

    return output.milestones
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && error.text) {
      const repaired = repairDoubleEncodedMilestones(error.text)
      if (repaired) return repaired
    }
    throw error
  }
}

export async function createPaymentMilestonesFromExtraction(
  projectId: string,
  milestones: (Omit<PaymentMilestoneInput, "date"> & { date: Date | null })[]
) {
  if (milestones.length === 0) return

  // The extraction schema allows a null date when the source text gives no
  // resolvable date; the DB column is required, so fall back to the
  // project's handover date (or today) rather than blocking the save.
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { handoverDate: true },
  })
  const fallbackDate = project?.handoverDate ?? new Date()

  await prisma.paymentMilestone.createMany({
    data: milestones.map((milestone) => ({
      ...toPaymentMilestoneData({
        ...milestone,
        date: milestone.date ?? fallbackDate,
      }),
      projectId,
    })),
  })
  revalidatePath(`/projects/${projectId}`)
}
