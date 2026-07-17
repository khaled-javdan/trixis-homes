import { z } from "zod"

import { projectStatusValues } from "./project"
import { propertyTypeValues } from "./unit-type"

const exportUnitTypeSchema = z.object({
  propertyType: z.enum(propertyTypeValues),
  label: z.string().nullable().optional(),
  unitCount: z.number().int().min(0).nullable().optional(),
  startingPrice: z.number().positive(),
  size: z.number().positive().nullable().optional(),
  plotSize: z.number().positive().nullable().optional(),
  bua: z.number().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  parking: z.number().int().min(0).nullable().optional(),
  paymentPlan: z.string().nullable().optional(),
  serviceCharge: z.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
  listingUrl: z.string().nullable().optional(),
})

const exportNoteSchema = z.object({
  body: z.string().min(1),
  createdAt: z.coerce.date().optional(),
})

const exportPaymentMilestoneSchema = z.object({
  label: z.string().min(1),
  percentage: z.number().positive().max(100),
  date: z.coerce.date(),
  note: z.string().nullable().optional(),
})

const exportProjectSchema = z.object({
  name: z.string().min(1),
  developer: z.string().min(1),
  masterCommunity: z.string().nullable().optional(),
  community: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  location: z.string().min(1),
  status: z.enum(projectStatusValues),
  launchDate: z.coerce.date().nullable().optional(),
  handoverDate: z.coerce.date().nullable().optional(),
  description: z.string().nullable().optional(),
  paymentPlan: z.string().nullable().optional(),
  downPaymentPercent: z.number().min(0).max(100).nullable().optional(),
  promoPaymentPlan: z.string().nullable().optional(),
  promoDownPaymentPercent: z.number().min(0).max(100).nullable().optional(),
  promotionNotes: z.string().nullable().optional(),
  serviceCharge: z.number().min(0).nullable().optional(),
  amenities: z.array(z.string()).optional(),
  sellingPoints: z.array(z.string()).optional(),
  investmentRating: z.number().int().min(1).max(5).nullable().optional(),
  luxuryRating: z.number().int().min(1).max(5).nullable().optional(),
  familyRating: z.number().int().min(1).max(5).nullable().optional(),
  waterfront: z.boolean().optional(),
  golf: z.boolean().optional(),
  brandedResidence: z.boolean().optional(),
  brandName: z.string().nullable().optional(),
  availableUnitsCount: z.number().int().min(0).nullable().optional(),
  link: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  unitTypes: z.array(exportUnitTypeSchema),
  notes: z.array(exportNoteSchema),
  paymentMilestones: z.array(exportPaymentMilestoneSchema).optional(),
})

export const projectExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  project: exportProjectSchema,
})

export type ProjectExport = z.infer<typeof projectExportSchema>
