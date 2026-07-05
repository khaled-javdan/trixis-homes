import { z } from "zod"

export const projectStatusValues = [
  "OFF_PLAN",
  "UNDER_CONSTRUCTION",
  "READY",
] as const

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  developer: z.string().trim().min(1).max(200),
  community: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().min(1).max(200),
  status: z.enum(projectStatusValues),
  handoverDate: z.coerce.date().optional().nullable(),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  paymentPlan: z.string().trim().max(500).optional().or(z.literal("")),
  link: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type ProjectInput = z.infer<typeof projectSchema>
