export type GeoCoordinates = {
  latitude: number
  longitude: number
}

export type GeoSearchResult = GeoCoordinates & {
  label: string
}

/**
 * Returns multiple ranked location matches via Nominatim, for an interactive
 * search box (unlike geocodeLocation, which only needs the single best match
 * for automatic geocoding on project create/update).
 */
export async function searchLocations(
  query: string,
  limit = 5
): Promise<GeoSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", trimmed)
    url.searchParams.set("format", "jsonv2")
    url.searchParams.set("limit", String(limit))

    const response = await fetch(url, {
      headers: {
        "User-Agent": "trixis-homes/1.0 (internal real estate tracker)",
      },
    })
    if (!response.ok) return []

    const results = (await response.json()) as Array<{
      lat: string
      lon: string
      display_name: string
    }>

    return results
      .map((result) => ({
        label: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
      }))
      .filter(
        (result) =>
          Number.isFinite(result.latitude) && Number.isFinite(result.longitude)
      )
  } catch (error) {
    console.error(`Failed to search locations for "${trimmed}":`, error)
    return []
  }
}

/**
 * Geocodes a free-text location via OpenStreetMap's Nominatim API.
 * Returns null on no match or any network/API failure — geocoding
 * failures must never block a project create/update.
 */
export async function geocodeLocation(
  query: string
): Promise<GeoCoordinates | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", trimmed)
    url.searchParams.set("format", "jsonv2")
    url.searchParams.set("limit", "1")

    const response = await fetch(url, {
      headers: {
        "User-Agent": "trixis-homes/1.0 (internal real estate tracker)",
      },
    })
    if (!response.ok) return null

    const results = (await response.json()) as Array<{
      lat: string
      lon: string
    }>
    const first = results[0]
    if (!first) return null

    const latitude = Number(first.lat)
    const longitude = Number(first.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

    return { latitude, longitude }
  } catch (error) {
    console.error(`Failed to geocode location "${trimmed}":`, error)
    return null
  }
}
