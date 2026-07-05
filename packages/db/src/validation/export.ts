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
  notes: z.string().nullable().optional(),
})

const exportNoteSchema = z.object({
  body: z.string().min(1),
  createdAt: z.coerce.date().optional(),
})

const exportProjectSchema = z.object({
  name: z.string().min(1),
  developer: z.string().min(1),
  community: z.string().nullable().optional(),
  location: z.string().min(1),
  status: z.enum(projectStatusValues),
  handoverDate: z.coerce.date().nullable().optional(),
  description: z.string().nullable().optional(),
  paymentPlan: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  unitTypes: z.array(exportUnitTypeSchema),
  notes: z.array(exportNoteSchema),
})

export const projectExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  project: exportProjectSchema,
})

export type ProjectExport = z.infer<typeof projectExportSchema>
