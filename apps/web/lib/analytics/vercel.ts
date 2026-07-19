import "server-only"

// Reads visitor metrics from the Vercel Web Analytics API for the marketing
// site (apps/marketing). Capture happens automatically via <Analytics /> once
// that app is deployed with Web Analytics enabled — until then these functions
// return empty/zeroed data so the dashboard still renders.
//
// Docs: https://vercel.com/docs/analytics/web-analytics-api
// Requires env: VERCEL_API_TOKEN, VERCEL_MARKETING_PROJECT_ID, VERCEL_TEAM_ID.

const API_BASE = "https://api.vercel.com/v1/query/web-analytics"

export type TrafficTotals = { pageviews: number; visitors: number }
export type DailyTraffic = {
  date: string
  pageviews: number
  visitors: number
}
export type DimensionRow = {
  label: string
  pageviews: number
  visitors: number
}

function config() {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_MARKETING_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !projectId) return null
  return { token, projectId, teamId }
}

/** Whether the Vercel Web Analytics env vars are set. */
export function isAnalyticsConfigured(): boolean {
  return config() !== null
}

async function query(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<{ data: unknown } | null> {
  const cfg = config()
  if (!cfg) return null

  const search = new URLSearchParams()
  search.set("projectId", cfg.projectId)
  if (cfg.teamId) search.set("teamId", cfg.teamId)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }

  try {
    const res = await fetch(`${API_BASE}/${path}?${search.toString()}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      // Vercel aggregates update roughly by the minute; cache briefly to keep
      // the dashboard responsive without hammering the API on every request.
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      console.warn(
        `[analytics] Vercel ${path} responded ${res.status}: ${await res
          .text()
          .catch(() => "")}`
      )
      return null
    }
    return (await res.json()) as { data: unknown }
  } catch (error) {
    console.warn(`[analytics] Vercel ${path} request failed`, error)
    return null
  }
}

export async function getTrafficTotals(
  since: string,
  until: string
): Promise<TrafficTotals> {
  const json = await query("visits/count", { since, until })
  const data = json?.data as Partial<TrafficTotals> | undefined
  return {
    pageviews: data?.pageviews ?? 0,
    visitors: data?.visitors ?? 0,
  }
}

export async function getDailyTraffic(
  since: string,
  until: string
): Promise<DailyTraffic[]> {
  const json = await query("visits/aggregate", { since, until, by: "day" })
  const rows = (json?.data as unknown[] | undefined) ?? []
  return rows.map((row) => {
    const r = row as {
      timestamp?: string
      pageviews?: number
      visitors?: number
    }
    return {
      date: (r.timestamp ?? "").slice(0, 10),
      pageviews: r.pageviews ?? 0,
      visitors: r.visitors ?? 0,
    }
  })
}

/**
 * Top values for a grouping dimension (e.g. `route`, `referrerHostname`,
 * `utmSource`). The response echoes the dimension name as the row key, so we
 * read it back out via `dimension`.
 */
async function getTopByDimension(
  dimension: string,
  since: string,
  until: string,
  limit = 8
): Promise<DimensionRow[]> {
  const json = await query("visits/aggregate", {
    since,
    until,
    by: dimension,
    limit,
  })
  const rows = (json?.data as unknown[] | undefined) ?? []
  return rows.map((row) => {
    const r = row as Record<string, unknown>
    const rawLabel = r[dimension]
    return {
      label:
        rawLabel === undefined || rawLabel === null || rawLabel === ""
          ? "Direct / none"
          : String(rawLabel),
      pageviews: typeof r.pageviews === "number" ? r.pageviews : 0,
      visitors: typeof r.visitors === "number" ? r.visitors : 0,
    }
  })
}

// `requestPath` is the actual visited URL (e.g. /projects/the-wilds-residences),
// matching the Vercel dashboard's Pages panel. (`route` would instead collapse
// dynamic pages to their pattern, e.g. /projects/[slug].)
export function getTopPages(since: string, until: string, limit?: number) {
  return getTopByDimension("requestPath", since, until, limit)
}

export function getTopReferrers(since: string, until: string, limit?: number) {
  return getTopByDimension("referrerHostname", since, until, limit)
}

export function getUtmSources(since: string, until: string, limit?: number) {
  return getTopByDimension("utmSource", since, until, limit)
}
