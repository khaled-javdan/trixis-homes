import { NextResponse } from "next/server"

import type { PropertyType } from "@workspace/db"

import {
  getPublishedProjectStats,
  type PublicProjectFilters,
} from "@/lib/projects"

export const dynamic = "force-dynamic"

const propertyTypeValues: PropertyType[] = [
  "APARTMENT",
  "TOWNHOUSE",
  "VILLA",
  "PENTHOUSE",
  "DUPLEX",
  "OFFICE",
  "RETAIL",
  "OTHER",
]

// Same query contract as /projects (community | propertyType | bedrooms |
// maxPrice); malformed values are ignored rather than rejected so the hero
// search's live count can never error a visitor.
function parseFilters(params: URLSearchParams): PublicProjectFilters {
  const filters: PublicProjectFilters = {}
  const community = params.get("community")?.trim()
  if (community) filters.community = community
  const propertyType = params.get("propertyType")
  if (propertyType && (propertyTypeValues as string[]).includes(propertyType)) {
    filters.propertyType = propertyType as PropertyType
  }
  const bedrooms = params.get("bedrooms")
  if (bedrooms) {
    const counts = bedrooms
      .split("|")
      .map(Number)
      .filter((count) => Number.isInteger(count) && count >= 0 && count <= 20)
    if (counts.length) filters.bedrooms = counts
  }
  const maxPrice = Number(params.get("maxPrice"))
  if (Number.isFinite(maxPrice) && maxPrice > 0) filters.maxPrice = maxPrice
  return filters
}

export async function GET(request: Request) {
  const stats = await getPublishedProjectStats(
    parseFilters(new URL(request.url).searchParams)
  )
  return NextResponse.json(stats)
}
