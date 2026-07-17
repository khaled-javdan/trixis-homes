import { z } from "zod"

import { projectStatusValues } from "./project"
import { propertyTypeValues } from "./unit-type"

// Lenient mirror schemas for LLM extraction of a developer availability sheet.
// Like ai-import.ts, fields are nullable (not optional) so the model must emit
// explicit nulls. Only perishable inventory fields are extracted — an update
// sheet never changes descriptive data (name, amenities, ratings, ...). A null
// means "not mentioned in the sheet" and must never be turned into a change.

export const inventoryExtractedUnitTypeSchema = z.object({
  propertyType: z.enum(propertyTypeValues),
  label: z.string().trim().max(120).nullable(),
  bedrooms: z.number().int().min(0).nullable(),
  unitCount: z.number().int().min(0).nullable(),
  startingPrice: z.number().min(0).nullable(),
  paymentPlan: z.string().trim().max(500).nullable(),
  serviceCharge: z.number().min(0).nullable(),
})

export const inventoryExtractedProjectSchema = z.object({
  name: z.string().trim().max(200).nullable(),
  developer: z.string().trim().max(200).nullable(),
  availableUnitsCount: z.number().int().min(0).nullable(),
  paymentPlan: z.string().trim().max(500).nullable(),
  downPaymentPercent: z.number().min(0).max(100).nullable(),
  promoPaymentPlan: z.string().trim().max(500).nullable(),
  promoDownPaymentPercent: z.number().min(0).max(100).nullable(),
  promotionNotes: z.string().trim().max(1000).nullable(),
  serviceCharge: z.number().min(0).nullable(),
  status: z.enum(projectStatusValues).nullable(),
  handoverDate: z
    .string()
    .describe("ISO 8601 date, e.g. 2030-12-31")
    .nullable(),
  unitTypes: z.array(inventoryExtractedUnitTypeSchema),
})

export const inventoryExtractionResultSchema = z.object({
  projects: z.array(inventoryExtractedProjectSchema),
})

// Apply-side patch schemas: every field optional — the client sends only the
// keys the admin accepted in the diff review, and only those are written.

export const inventoryProjectPatchSchema = z.object({
  availableUnitsCount: z.number().int().min(0).nullable().optional(),
  paymentPlan: z.string().trim().max(500).nullable().optional(),
  downPaymentPercent: z.number().min(0).max(100).nullable().optional(),
  promoPaymentPlan: z.string().trim().max(500).nullable().optional(),
  promoDownPaymentPercent: z.number().min(0).max(100).nullable().optional(),
  promotionNotes: z.string().trim().max(1000).nullable().optional(),
  serviceCharge: z.number().min(0).nullable().optional(),
  status: z.enum(projectStatusValues).optional(),
  handoverDate: z.string().nullable().optional(),
})

export const inventoryUnitTypePatchSchema = z.object({
  unitCount: z.number().int().min(0).nullable().optional(),
  startingPrice: z.number().positive().optional(),
  paymentPlan: z.string().trim().max(500).nullable().optional(),
  serviceCharge: z.number().min(0).nullable().optional(),
})

export type InventoryExtractedUnitType = z.infer<
  typeof inventoryExtractedUnitTypeSchema
>
export type InventoryExtractedProject = z.infer<
  typeof inventoryExtractedProjectSchema
>
export type InventoryExtractionResult = z.infer<
  typeof inventoryExtractionResultSchema
>
export type InventoryProjectPatch = z.infer<typeof inventoryProjectPatchSchema>
export type InventoryUnitTypePatch = z.infer<
  typeof inventoryUnitTypePatchSchema
>
