import { projectSchema, type ProjectInput } from "@workspace/db/validation/project"
import {
  unitTypeSchema,
  type UnitTypeInput,
} from "@workspace/db/validation/unit-type"

export function toProjectData(input: ProjectInput) {
  const parsed = projectSchema.parse(input)
  return {
    name: parsed.name,
    developer: parsed.developer,
    community: parsed.community || null,
    location: parsed.location,
    status: parsed.status,
    handoverDate: parsed.handoverDate ?? null,
    description: parsed.description || null,
    paymentPlan: parsed.paymentPlan || null,
  }
}

export function toUnitTypeData(input: UnitTypeInput) {
  const parsed = unitTypeSchema.parse(input)
  return {
    category: parsed.category,
    label: parsed.label || null,
    unitCount: parsed.unitCount ?? null,
    startingPrice: parsed.startingPrice,
    size: parsed.size ?? null,
    plotSize: parsed.plotSize ?? null,
    bua: parsed.bua ?? null,
    bedrooms: parsed.bedrooms ?? null,
    bathrooms: parsed.bathrooms ?? null,
    parking: parsed.parking ?? null,
    paymentPlan: parsed.paymentPlan || null,
    notes: parsed.notes || null,
  }
}
