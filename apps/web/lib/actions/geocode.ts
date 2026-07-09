"use server"

import { searchLocations, type GeoSearchResult } from "@/lib/geocode"

export async function searchLocationSuggestions(
  query: string
): Promise<GeoSearchResult[]> {
  return searchLocations(query)
}
