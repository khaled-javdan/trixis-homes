import type { ProjectStatus, UnitCategory } from "@workspace/db"

const unitCategoryLabels: Record<UnitCategory, string> = {
  STUDIO: "Studio",
  ONE_BR: "1BR",
  TWO_BR: "2BR",
  THREE_BR: "3BR",
  FOUR_BR: "4BR",
  FIVE_BR_PLUS: "5+BR",
  PENTHOUSE: "Penthouse",
  TOWNHOUSE: "Townhouse",
  VILLA: "Villa",
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

export function formatUnitCategory(category: UnitCategory) {
  return unitCategoryLabels[category]
}

export function formatProjectStatus(status: ProjectStatus) {
  return projectStatusLabels[status]
}

export function formatPrice(value: number | null | undefined) {
  if (value == null) return null
  return `AED ${Math.round(value).toLocaleString("en-US")}`
}

export function formatPriceCompact(value: number | null | undefined) {
  if (value == null) return null
  return `AED ${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
}

export function formatArea(value: number | null | undefined) {
  if (value == null) return null
  return `${Math.round(value).toLocaleString("en-US")} sq ft`
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date)
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
