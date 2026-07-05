import { z } from "zod"

export const unitCategoryValues = [
  "STUDIO",
  "ONE_BR",
  "TWO_BR",
  "THREE_BR",
  "FOUR_BR",
  "FIVE_BR_PLUS",
  "PENTHOUSE",
  "TOWNHOUSE",
  "VILLA",
  "DUPLEX",
  "OFFICE",
  "RETAIL",
  "OTHER",
] as const

export const unitTypeSchema = z.object({
  category: z.enum(unitCategoryValues),
  label: z.string().trim().max(120).optional().or(z.literal("")),
  unitCount: z.coerce.number().int().min(0).optional().nullable(),
  startingPrice: z.coerce.number().positive(),
  size: z.coerce.number().positive().optional().nullable(),
  plotSize: z.coerce.number().positive().optional().nullable(),
  bua: z.coerce.number().positive().optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  parking: z.coerce.number().int().min(0).optional().nullable(),
  paymentPlan: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type UnitTypeInput = z.infer<typeof unitTypeSchema>
