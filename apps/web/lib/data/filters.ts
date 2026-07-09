import type { ProjectStatus, PropertyType } from "@workspace/db"

import type { DashboardFilters } from "./projects"

// Multi-value filters are encoded as a single query-string value joined with
// "|" (not ","), since free-text fields like paymentPlan routinely contain
// commas themselves (e.g. "100% on handover (ready unit, mortgage-eligible)").
const LIST_SEPARATOR = "|"

export type RawSearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function parseList(value: string | string[] | undefined): string[] {
  const raw = first(value)
  if (!raw) return []
  return raw
    .split(LIST_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseNumber(value: string | string[] | undefined): number | undefined {
  const raw = first(value)
  if (!raw) return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseBool(value: string | string[] | undefined): boolean {
  return first(value) === "1"
}

export function encodeList(values: string[]): string {
  return values.join(LIST_SEPARATOR)
}

export function parseDashboardFilters(
  params: RawSearchParams
): DashboardFilters {
  return {
    q: first(params.q) || undefined,
    developers: parseList(params.developer),
    communities: parseList(params.community),
    cities: parseList(params.city),
    statuses: parseList(params.status) as ProjectStatus[],
    propertyTypes: parseList(params.propertyType) as PropertyType[],
    bedrooms: parseList(params.bedrooms)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
    paymentPlans: parseList(params.paymentPlan),
    minPrice: parseNumber(params.minPrice),
    maxPrice: parseNumber(params.maxPrice),
    minYear: parseNumber(params.minYear),
    maxYear: parseNumber(params.maxYear),
    waterfront: parseBool(params.waterfront),
    golf: parseBool(params.golf),
    brandedResidence: parseBool(params.branded),
    promotionActive: parseBool(params.promotion),
    onlyAvailable: parseBool(params.available),
  }
}

export function hasActiveDashboardFilters(filters: DashboardFilters): boolean {
  return (
    !!filters.q ||
    filters.developers.length > 0 ||
    filters.communities.length > 0 ||
    filters.cities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.propertyTypes.length > 0 ||
    filters.bedrooms.length > 0 ||
    filters.paymentPlans.length > 0 ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.minYear != null ||
    filters.maxYear != null ||
    !!filters.waterfront ||
    !!filters.golf ||
    !!filters.brandedResidence ||
    !!filters.promotionActive ||
    !!filters.onlyAvailable
  )
}
