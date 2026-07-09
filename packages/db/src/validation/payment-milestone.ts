import { z } from "zod"

export const paymentMilestoneTimingValues = [
  "ON_BOOKING",
  "DURING_CONSTRUCTION",
  "ON_HANDOVER",
  "AFTER_HANDOVER",
  "FIXED_DATE",
] as const

export const paymentMilestoneSchema = z
  .object({
    label: z.string().trim().min(1).max(120),
    percentage: z.coerce.number().positive().max(100),
    timing: z.enum(paymentMilestoneTimingValues),
    offsetMonths: z.coerce
      .number()
      .int()
      .min(0)
      .max(120)
      .optional()
      .nullable(),
    fixedDate: z.coerce.date().optional().nullable(),
    note: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine((data) => data.timing !== "AFTER_HANDOVER" || data.offsetMonths != null, {
    message: "Months after handover is required",
    path: ["offsetMonths"],
  })
  .refine((data) => data.timing !== "FIXED_DATE" || data.fixedDate != null, {
    message: "Date is required",
    path: ["fixedDate"],
  })

export type PaymentMilestoneInput = z.infer<typeof paymentMilestoneSchema>

// Lenient mirror of paymentMilestoneSchema for LLM structured extraction —
// fields are nullable (not optional) so the model must explicitly emit null
// instead of omitting a key. percentage/timing are the only fields a real
// payment plan always states, so they stay required.
export const extractedPaymentMilestoneSchema = z.object({
  label: z.string().trim().max(120),
  percentage: z.number().positive().max(100),
  timing: z.enum(paymentMilestoneTimingValues),
  offsetMonths: z.number().int().min(0).max(120).nullable(),
  fixedDate: z
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
