import { redirect } from "next/navigation"
import { TriangleAlertIcon } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"

import { RangePicker } from "@/components/analytics/range-picker"
import { StatCard } from "@/components/analytics/stat-card"
import { TopList } from "@/components/analytics/top-list"
import { TrendChart, type TrendPoint } from "@/components/analytics/trend-chart"
import {
  getDailyTraffic,
  getTopReferrers,
  getTopRoutes,
  getTrafficTotals,
  getUtmSources,
  isAnalyticsConfigured,
} from "@/lib/analytics/vercel"
import { isAdmin } from "@/lib/auth"
import { getLeadCountsByDay, getLeadTotal } from "@/lib/data/leads"

const ALLOWED_RANGES = new Set([7, 30, 90])

// Marketing-site visitor metrics come from the Vercel Web Analytics API; lead
// numbers come from our own database. Kept fresh on each request (the Vercel
// read layer caches upstream calls for a few minutes).
export const dynamic = "force-dynamic"

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  if (!(await isAdmin())) {
    redirect("/login?next=/analytics")
  }

  const { range } = await searchParams
  const days = ALLOWED_RANGES.has(Number(range)) ? Number(range) : 30

  const until = new Date()
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000)
  const sinceKey = toDateKey(since)
  const untilKey = toDateKey(until)

  const [totals, daily, topRoutes, topReferrers, utmSources, leadTotal, leadsByDay] =
    await Promise.all([
      getTrafficTotals(sinceKey, untilKey),
      getDailyTraffic(sinceKey, untilKey),
      getTopRoutes(sinceKey, untilKey),
      getTopReferrers(sinceKey, untilKey),
      getUtmSources(sinceKey, untilKey),
      getLeadTotal(since, until),
      getLeadCountsByDay(since, until),
    ])

  // Build a continuous daily axis so leads line up with visitor days even when
  // one source has gaps.
  const axis: string[] = []
  for (let i = 0; i < days; i++) {
    axis.push(toDateKey(new Date(since.getTime() + i * 24 * 60 * 60 * 1000)))
  }
  const visitorsByDay = new Map(daily.map((d) => [d.date, d.visitors]))
  const trend: TrendPoint[] = axis.map((date) => ({
    date,
    visitors: visitorsByDay.get(date) ?? 0,
    leads: leadsByDay[date] ?? 0,
  }))

  const conversion =
    totals.visitors > 0
      ? `${((leadTotal / totals.visitors) * 100).toFixed(1)}%`
      : "—"

  const configured = isAnalyticsConfigured()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visitors to the marketing site and how they convert to leads.
          </p>
        </div>
        <RangePicker current={days} />
      </div>

      {!configured ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 py-1 text-sm">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Visitor data isn&apos;t connected yet</p>
              <p className="mt-1 text-muted-foreground">
                Deploy the marketing site to Vercel with Web Analytics enabled,
                then set <code>VERCEL_API_TOKEN</code>,{" "}
                <code>VERCEL_MARKETING_PROJECT_ID</code>, and{" "}
                <code>VERCEL_TEAM_ID</code>. Lead numbers below are live from the
                database in the meantime.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Visitors"
          value={totals.visitors.toLocaleString()}
          hint={`Last ${days} days`}
        />
        <StatCard
          label="Pageviews"
          value={totals.pageviews.toLocaleString()}
          hint={`Last ${days} days`}
        />
        <StatCard
          label="Leads"
          value={leadTotal.toLocaleString()}
          hint={`Last ${days} days`}
        />
        <StatCard
          label="Conversion"
          value={conversion}
          hint="Leads ÷ visitors"
        />
      </div>

      <TrendChart data={trend} />

      <div className="grid gap-4 lg:grid-cols-3">
        <TopList title="Top pages" rows={topRoutes} metric="pageviews" />
        <TopList title="Top referrers" rows={topReferrers} />
        <TopList
          title="Campaign sources (UTM)"
          rows={utmSources}
          emptyLabel="No campaign traffic yet"
        />
      </div>
    </div>
  )
}
