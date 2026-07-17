import { z } from "zod"

export const leadTypeValues = [
  "BROCHURE",
  "FLOOR_PLAN",
  "PRICE_LIST",
  "ENQUIRY",
] as const

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(32).optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().min(1).max(2000).optional().or(z.literal("").transform(() => undefined)),
  type: z.enum(leadTypeValues).default("ENQUIRY"),
  projectId: z.string().trim().min(1).optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
