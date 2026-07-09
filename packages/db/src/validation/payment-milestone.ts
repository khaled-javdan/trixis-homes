import { z } from "zod"

export const paymentMilestoneSchema = z.object({
  label: z.string().trim().min(1).max(120),
  percentage: z.coerce.number().positive().max(100),
  date: z.coerce.date(),
  note: z.string().trim().max(300).optional().or(z.literal("")),
})

export type PaymentMilestoneInput = z.infer<typeof paymentMilestoneSchema>

// Lenient mirror of paymentMilestoneSchema for LLM structured extraction —
// fields are nullable (not optional) so the model must explicitly emit null
// instead of omitting a key. percentage is the only field a real payment
// plan always states, so it stays required; date is nullable because source
// text sometimes only gives relative wording ("during construction") with no
// resolvable calendar date — the review UI surfaces that instead of guessing.
export const extractedPaymentMilestoneSchema = z.object({
  label: z.string().trim().max(120),
  percentage: z.number().positive().max(100),
  date: z
    .string()
    .describe("ISO 8601 date, e.g. 2027-03-31")
    .nullable(),
  note: z.string().trim().max(300).nullable(),
})

export const paymentMilestoneExtractionResultSchema = z.object({
  milestones: z.array(extractedPaymentMilestoneSchema),
})

export type ExtractedPaymentMilestone = z.infer<
  typeof extractedPaymentMilestoneSchema
>
export type PaymentMilestoneExtractionResult = z.infer<
  typeof paymentMilestoneExtractionResultSchema
>
