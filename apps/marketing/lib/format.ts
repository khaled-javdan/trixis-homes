import type { ProjectStatus, PropertyType } from "@workspace/db"

const propertyTypeLabels: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  TOWNHOUSE: "Townhouse",
  VILLA: "Villa",
  PENTHOUSE: "Penthouse",
  DUPLEX: "Duplex",
  OFFICE: "Office",
  RETAIL: "Retail",
  OTHER: "Other",
}

const projectStatusLabels: Record<ProjectStatus, string> = {
  OFF_PLAN: "Off-Plan",
  UNDER_CONSTRUCTION: "Under Construction",
  READY: "Ready",
}

export function formatPropertyType(propertyType: PropertyType) {
  return propertyTypeLabels[propertyType]
}

export function formatPropertyTypes(propertyTypes: PropertyType[]) {
  return propertyTypes
    .map((type) => {
      const label = propertyTypeLabels[type]
      return label.endsWith("x") ? `${label}es` : `${label}s`
    })
    .join(", ")
}

export function formatProjectStatus(status: ProjectStatus) {
  return projectStatusLabels[status]
}

// "AED 3.9M" — the public site only ever shows starting prices, compacted.
export function formatPriceShort(value: number | null | undefined) {
  if (value == null) return null
  const compact = Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
  return `AED ${compact}`
}

export function formatBedroomsList(bedrooms: number[]) {
  if (!bedrooms.length) return null
  return bedrooms.map((count) => (count === 0 ? "Studio" : count)).join(", ")
}

export function formatSizeRange(
  range: { min: number; max: number } | null | undefined
) {
  if (!range) return null
  const format = (value: number) => Math.round(value).toLocaleString("en-US")
  if (range.min === range.max) return `${format(range.min)} sq.ft`
  return `${format(range.min)} – ${format(range.max)} sq.ft`
}

export function formatHandoverYear(value: string | null | undefined) {
  return value ? String(new Date(value).getFullYear()) : null
}

export function formatHandoverQuarter(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
}

// Payment plans are stored with explanatory text, e.g. "60/40 (60% during
// construction…)". Public cards only need the ratio.
export function formatPaymentPlanShort(value: string | null | undefined) {
  if (!value) return null
  const withoutParenthetical = value.replace(/\s*\([^)]*\)\s*$/, "").trim()
  const ratio = withoutParenthetical.match(
    /^\d+(?:\.\d+)?%?(?:\s*\/\s*\d+(?:\.\d+)?%?)?/
  )
  return ratio?.[0] || withoutParenthetical || value.trim()
}
