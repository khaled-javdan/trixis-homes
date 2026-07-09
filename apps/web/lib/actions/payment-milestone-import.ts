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

const SYSTEM_PROMPT = `You extract a structured payment milestone breakdown from a UAE real
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
- timing is one of:
  - ON_BOOKING: due at reservation/booking/down payment/SPA signing, before construction.
  - DURING_CONSTRUCTION: due during the construction period, tied to a construction
    percentage/milestone, or simply labeled "during construction" with no specific date.
  - ON_HANDOVER: due at handover/completion/transfer of title.
  - AFTER_HANDOVER: due a number of months after handover (a post-handover plan) — set
    offsetMonths to that number of months.
  - FIXED_DATE: the source gives a specific calendar date or quarter for this installment
    (not phrased relative to booking/handover) — set fixedDate to that date in ISO format
    (YYYY-MM-DD). For a quarter, use the last day of the quarter (Q1 -> 03-31, Q2 -> 06-30,
    Q3 -> 09-30, Q4 -> 12-31) with the stated year.
- offsetMonths is required (non-null) only when timing is AFTER_HANDOVER; null otherwise.
- fixedDate is required (non-null) only when timing is FIXED_DATE; null otherwise.
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
}): Promise<ExtractedPaymentMilestone[]> {
  const text = input.text?.trim()
  if (!text && !input.imageDataUrl) return []

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-5",
      system: SYSTEM_PROMPT,
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
  milestones: PaymentMilestoneInput[]
) {
  if (milestones.length === 0) return

  const count = await prisma.paymentMilestone.count({ where: { projectId } })
  await prisma.paymentMilestone.createMany({
    data: milestones.map((milestone, index) => ({
      ...toPaymentMilestoneData(milestone),
      projectId,
      sortOrder: count + index,
    })),
  })
  revalidatePath(`/projects/${projectId}`)
}
