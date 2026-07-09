import { z } from "zod"

export const projectStatusValues = [
  "OFF_PLAN",
  "UNDER_CONSTRUCTION",
  "READY",
] as const

const ratingSchema = z.coerce.number().int().min(1).max(5).optional().nullable()

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  developer: z.string().trim().min(1).max(200),
  masterCommunity: z.string().trim().max(200).optional().or(z.literal("")),
  community: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().min(1).max(200),
  status: z.enum(projectStatusValues),
  handoverDate: z.coerce.date().optional().nullable(),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  paymentPlan: z.string().trim().max(500).optional().or(z.literal("")),
  downPaymentPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  promoPaymentPlan: z.string().trim().max(500).optional().or(z.literal("")),
  promoDownPaymentPercent: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .nullable(),
  promotionNotes: z.string().trim().max(1000).optional().or(z.literal("")),
  serviceCharge: z.coerce.number().min(0).optional().nullable(),
  amenities: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  sellingPoints: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  investmentRating: ratingSchema,
  luxuryRating: ratingSchema,
  familyRating: ratingSchema,
  waterfront: z.boolean().optional(),
  golf: z.boolean().optional(),
  brandedResidence: z.boolean().optional(),
  brandName: z.string().trim().max(200).optional().or(z.literal("")),
  availableUnitsCount: z.coerce.number().int().min(0).optional().nullable(),
  link: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type ProjectInput = z.infer<typeof projectSchema>
