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

function formatBedrooms(bedrooms: number | null | undefined) {
  if (bedrooms == null) return null
  return bedrooms === 0 ? "Studio" : `${bedrooms}BR`
}

// Combines property type + bedroom count into a natural unit type name, e.g.
// "2BR" for a 2-bedroom apartment, "2BR Townhouse" for a 2-bedroom townhouse,
// or just "Villa" when no bedroom count is set.
export function formatUnitTypeName(
  propertyType: PropertyType,
  bedrooms: number | null | undefined
) {
  const typeLabel = formatPropertyType(propertyType)
  const bedroomLabel = formatBedrooms(bedrooms)
  if (!bedroomLabel) return typeLabel
  return propertyType === "APARTMENT" ? bedroomLabel : `${bedroomLabel} ${typeLabel}`
}

export function formatProjectStatus(status: ProjectStatus) {
  return projectStatusLabels[status]
}

// The official UAE Dirham symbol (Central Bank of the UAE, March 2025;
// assigned U+20C3 in Unicode 18). Most fonts don't render the glyph yet, so
// UI that needs it visually should render <DirhamSymbol /> instead of this
// character — this is for plain-text-only contexts (quiz answers, etc.).
export const DIRHAM_SIGN = "⃃"

export function formatPrice(value: number | null | undefined) {
  if (value == null) return null
  return Math.round(value).toLocaleString("en-US")
}

export function formatPriceCompact(value: number | null | undefined) {
  if (value == null) return null
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPriceWithSymbol(value: number | null | undefined) {
  const formatted = formatPrice(value)
  return formatted == null ? null : `${DIRHAM_SIGN} ${formatted}`
}

export function formatServiceCharge(value: number | null | undefined) {
  if (value == null) return null
  return value.toFixed(2)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`
}

export function formatArea(value: number | null | undefined) {
  if (value == null) return null
  return `${Math.round(value).toLocaleString("en-US")} sq ft`
}

export function formatAreaRange(
  range: { min: number; max: number } | null | undefined
) {
  if (!range) return null
  if (range.min === range.max) return formatArea(range.min)
  return `${Math.round(range.min).toLocaleString("en-US")}–${Math.round(range.max).toLocaleString("en-US")} sq ft`
}

// Areas are stored in sq ft everywhere; this is only for converting values
// entered/displayed in sq m back and forth in the unit type form.
export const SQFT_PER_SQM = 10.7639

export function sqftToSqm(value: number) {
  return value / SQFT_PER_SQM
}

export function sqmToSqft(value: number) {
  return value * SQFT_PER_SQM
}

export function formatAreaInUnit(
  value: number | null | undefined,
  unit: "ft" | "m"
) {
  if (value == null) return null
  const converted = unit === "m" ? sqftToSqm(value) : value
  return `${Math.round(converted).toLocaleString("en-US")} sq ${unit}`
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `Q${quarter} ${date.getFullYear()}`
}

export const quarterValues = ["1", "2", "3", "4"] as const

export function dateToQuarter(value: string | Date | null | undefined) {
  if (!value) return { quarter: "", year: "" }
  const date = typeof value === "string" ? new Date(value) : value
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return { quarter: String(quarter), year: String(date.getFullYear()) }
}

export function quarterToDate(quarter: string, year: string): Date | null {
  if (!quarter || !year) return null
  const quarterNumber = Number(quarter)
  const yearNumber = Number(year)
  if (!Number.isInteger(quarterNumber) || !Number.isInteger(yearNumber)) {
    return null
  }
  return new Date(yearNumber, (quarterNumber - 1) * 3, 1)
}

// Payment plans are often stored with explanatory text, e.g.
// "60/40 (60% during construction, 40% on handover)" or "100% on handover
// (ready unit)". That detail is useful on the project detail page but
// redundant in compact list/card/filter UI, where the ratio alone (e.g.
// "60/40" or "100%") is self-explanatory.
export function formatPaymentPlanShort(value: string | null | undefined) {
  if (!value) return null
  const withoutParenthetical = value.replace(/\s*\([^)]*\)\s*$/, "").trim()
  const ratio = withoutParenthetical.match(
    /^\d+(?:\.\d+)?%?(?:\s*\/\s*\d+(?:\.\d+)?%?)?/
  )
  return ratio?.[0] || withoutParenthetical || value.trim()
}

export function normalizeUrl(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function formatDateShort(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatMonthYear(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date)
}

export function formatRelativeToNow(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })
  if (Math.abs(diffDays) < 1) return formatter.format(0, "day")
  if (Math.abs(diffDays) < 30) return formatter.format(diffDays, "day")
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) return formatter.format(diffMonths, "month")
  const diffYears = Math.round(diffMonths / 12)
  return formatter.format(diffYears, "year")
}
