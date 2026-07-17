import { z } from "zod"

import { projectStatusValues } from "./project"
import { propertyTypeValues } from "./unit-type"

// Lenient mirror of unitTypeSchema/projectSchema for LLM structured extraction.
// Fields are nullable (not optional) so the model must explicitly emit null
// instead of omitting a key, and required-at-creation fields (name, developer,
// location, startingPrice) are relaxed since a pasted snippet may not mention
// them — the review UI prompts the user to fill in whatever is missing.

export const extractedUnitTypeSchema = z.object({
  propertyType: z.enum(propertyTypeValues),
  label: z.string().trim().max(120).nullable(),
  unitCount: z.number().int().min(0).nullable(),
  startingPrice: z.number().min(0).nullable(),
  size: z.number().positive().nullable(),
  plotSize: z.number().positive().nullable(),
  bua: z.number().positive().nullable(),
  bedrooms: z.number().int().min(0).nullable(),
  bathrooms: z.number().int().min(0).nullable(),
  parking: z.number().int().min(0).nullable(),
  paymentPlan: z.string().trim().max(500).nullable(),
  serviceCharge: z.number().min(0).nullable(),
  notes: z.string().trim().max(2000).nullable(),
})

export const extractedProjectSchema = z.object({
  name: z.string().trim().max(200).nullable(),
  developer: z.string().trim().max(200).nullable(),
  community: z.string().trim().max(200).nullable(),
  city: z.string().trim().max(200).nullable(),
  location: z.string().trim().max(200).nullable(),
  status: z.enum(projectStatusValues).nullable(),
  launchDate: z
    .string()
    .describe("ISO 8601 date, e.g. 2024-09-15")
    .nullable(),
  handoverDate: z
    .string()
    .describe("ISO 8601 date, e.g. 2030-12-31")
    .nullable(),
  description: z.string().trim().max(4000).nullable(),
  paymentPlan: z.string().trim().max(500).nullable(),
  downPaymentPercent: z.number().min(0).max(100).nullable(),
  promoPaymentPlan: z.string().trim().max(500).nullable(),
  promoDownPaymentPercent: z.number().min(0).max(100).nullable(),
  promotionNotes: z.string().trim().max(1000).nullable(),
  serviceCharge: z.number().min(0).nullable(),
  amenities: z.array(z.string().trim().min(1).max(100)),
  sellingPoints: z.array(z.string().trim().min(1).max(300)),
  investmentRating: z.number().int().min(1).max(5).nullable(),
  luxuryRating: z.number().int().min(1).max(5).nullable(),
  familyRating: z.number().int().min(1).max(5).nullable(),
  waterfront: z.boolean(),
  golf: z.boolean(),
  brandedResidence: z.boolean(),
  brandName: z.string().trim().max(200).nullable(),
  availableUnitsCount: z.number().int().min(0).nullable(),
  unitTypes: z.array(extractedUnitTypeSchema),
})

export const extractionResultSchema = z.object({
  projects: z.array(extractedProjectSchema),
})

export type ExtractedUnitType = z.infer<typeof extractedUnitTypeSchema>
export type ExtractedProject = z.infer<typeof extractedProjectSchema>
export type ExtractionResult = z.infer<typeof extractionResultSchema>
