import { formatProjectStatus, formatPropertyType } from "@/lib/format"
import type { ProjectCard } from "@/lib/data/projects"

export type CopilotUnitTypeSummary = {
  label: string
  propertyType: string
  bedrooms: number | null
  startingPrice: number
  bua: number | null
}

export type CopilotProjectSummary = {
  id: string
  name: string
  developer: string
  community: string | null
  city: string | null
  status: string
  completionYear: number | null
  priceRange: { min: number; max: number } | null
  unitTypes: CopilotUnitTypeSummary[]
  paymentPlan: string | null
  downPaymentPercent: number | null
  promotion: {
    active: boolean
    paymentPlan: string | null
    downPaymentPercent: number | null
    notes: string | null
  }
  serviceCharge: number | null
  investmentRating: number | null
  luxuryRating: number | null
  familyRating: number | null
  waterfront: boolean
  golf: boolean
  brandedResidence: boolean
  brandName: string | null
  amenities: string[]
  sellingPoints: string[]
  availableUnitsCount: number | null
  description: string | null
}

// Compact, token-efficient serialization of a filtered project for the
// copilot's model context — every field the model can ground a
// recommendation, objection response, or talking point in, and nothing else.
export function toCopilotProjectSummary(
  project: ProjectCard
): CopilotProjectSummary {
  const promotionActive =
    project.promoPaymentPlan != null ||
    project.promoDownPaymentPercent != null ||
    project.promotionNotes != null

  return {
    id: project.id,
    name: project.name,
    developer: project.developer,
    community: project.community,
    city: project.city,
    status: formatProjectStatus(project.status),
    completionYear: project.completionYear,
    priceRange:
      project.startingPrice != null && project.maxPrice != null
        ? { min: project.startingPrice, max: project.maxPrice }
        : null,
    unitTypes: project.unitTypes.map((unit) => ({
      label: unit.label ?? formatPropertyType(unit.propertyType),
      propertyType: formatPropertyType(unit.propertyType),
      bedrooms: unit.bedrooms,
      startingPrice: unit.startingPrice,
      bua: unit.bua,
    })),
    paymentPlan: project.paymentPlan,
    downPaymentPercent: project.downPaymentPercent,
    promotion: {
      active: promotionActive,
      paymentPlan: project.promoPaymentPlan,
      downPaymentPercent: project.promoDownPaymentPercent,
      notes: project.promotionNotes,
    },
    serviceCharge: project.serviceCharge,
    investmentRating: project.investmentRating,
    luxuryRating: project.luxuryRating,
    familyRating: project.familyRating,
    waterfront: project.waterfront,
    golf: project.golf,
    brandedResidence: project.brandedResidence,
    brandName: project.brandName,
    amenities: project.amenities,
    sellingPoints: project.sellingPoints,
    availableUnitsCount: project.availableUnitsCount,
    description: project.description ? project.description.slice(0, 600) : null,
  }
}

export function summarizeActiveFilters(filters: {
  q?: string
  developers: string[]
  communities: string[]
  cities: string[]
  statuses: string[]
  propertyTypes: string[]
  bedrooms: number[]
  paymentPlans: string[]
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  waterfront?: boolean
  golf?: boolean
  brandedResidence?: boolean
  promotionActive?: boolean
  onlyAvailable?: boolean
}): string[] {
  const chips: string[] = []
  if (filters.q) chips.push(`Search: "${filters.q}"`)
  if (filters.developers.length)
    chips.push(`Developer: ${filters.developers.join(", ")}`)
  if (filters.communities.length)
    chips.push(`Community: ${filters.communities.join(", ")}`)
  if (filters.cities.length) chips.push(`City: ${filters.cities.join(", ")}`)
  if (filters.statuses.length)
    chips.push(`Status: ${filters.statuses.join(", ")}`)
  if (filters.propertyTypes.length)
    chips.push(`Property Type: ${filters.propertyTypes.join(", ")}`)
  if (filters.bedrooms.length)
    chips.push(
      `Bedrooms: ${filters.bedrooms.map((b) => (b >= 5 ? "5+" : b)).join(", ")}`
    )
  if (filters.paymentPlans.length)
    chips.push(`Payment Plan: ${filters.paymentPlans.join(", ")}`)
  if (filters.minPrice != null || filters.maxPrice != null) {
    chips.push(
      `Price: ${filters.minPrice?.toLocaleString() ?? "0"} – ${
        filters.maxPrice?.toLocaleString() ?? "∞"
      } AED`
    )
  }
  if (filters.minYear != null || filters.maxYear != null) {
    chips.push(
      `Completion: ${filters.minYear ?? "…"} – ${filters.maxYear ?? "…"}`
    )
  }
  if (filters.waterfront) chips.push("Waterfront")
  if (filters.golf) chips.push("Golf")
  if (filters.brandedResidence) chips.push("Branded Residence")
  if (filters.promotionActive) chips.push("Promotion Active")
  if (filters.onlyAvailable) chips.push("Only Available Units")
  return chips
}
