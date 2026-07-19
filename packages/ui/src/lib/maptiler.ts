/** MapTiler configuration shared by every map in the app.
 *
 * Set NEXT_PUBLIC_MAPTILER_KEY in each app that renders a map. Get a free key
 * at https://cloud.maptiler.com/account/keys/ . Because the value is public
 * (it ships to the browser), lock it down in the MapTiler dashboard with an
 * allowed-origins list rather than treating it as a secret. */
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY

/** Default basemap style. `streets-v2` keeps road/place labels, which is what
 * you want for "where is this project". Swap for `dataviz-light`, `basic-v2`,
 * etc. per MapTiler's style catalogue. */
export const MAPTILER_STYLE = "streets-v2"

/** Label language for the rendered raster tiles. MapTiler otherwise labels each
 * region in its local language (Arabic in the UAE). `latin` renders every name
 * in Latin script — including transliterating names that have no English
 * translation — so no Arabic labels remain. Use an ISO code like `en` instead
 * to prefer real English names and fall back to local script where none exist. */
export const MAPTILER_LANGUAGE = "latin"

/** Whether a key is configured. Callers should fall back to a text-only view
 * when this is false so a missing key never renders a broken map. */
export function hasMapTilerKey(): boolean {
  return Boolean(MAPTILER_KEY)
}

/** Raster XYZ tile template for a Leaflet `TileLayer`. `{r}` expands to `@2x`
 * on retina screens when the layer has `detectRetina` enabled. `language`
 * forces English labels instead of the region's local script. */
export function maptilerTileUrl(style: string = MAPTILER_STYLE): string {
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}{r}.png?key=${MAPTILER_KEY}&language=${MAPTILER_LANGUAGE}`
}

export const MAPTILER_ATTRIBUTION =
  '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a>'
