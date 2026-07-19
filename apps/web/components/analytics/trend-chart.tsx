import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export type TrendPoint = { date: string; visitors: number; leads: number }

// Dependency-free inline-SVG chart (matches the app's no-chart-library
// convention). Visitors render as a filled area on the left scale; leads render
// as a line on their own right scale, since lead counts are far smaller — the
// legend surfaces each series' peak so the independent scales aren't misread.
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const W = 760
  const H = 240
  const padX = 8
  const padY = 16

  const maxVisitors = Math.max(1, ...data.map((d) => d.visitors))
  const maxLeads = Math.max(1, ...data.map((d) => d.leads))
  const n = data.length

  function x(i: number) {
    if (n <= 1) return padX
    return padX + (i / (n - 1)) * (W - padX * 2)
  }
  function yVisitors(v: number) {
    return H - padY - (v / maxVisitors) * (H - padY * 2)
  }
  function yLeads(v: number) {
    return H - padY - (v / maxLeads) * (H - padY * 2)
  }

  const visitorLine = data.map((d, i) => `${x(i)},${yVisitors(d.visitors)}`)
  const visitorArea =
    n > 0
      ? `${padX},${H - padY} ${visitorLine.join(" ")} ${x(n - 1)},${H - padY}`
      : ""
  const leadLine = data.map((d, i) => `${x(i)},${yLeads(d.leads)}`).join(" ")

  const hasData = data.some((d) => d.visitors > 0 || d.leads > 0)

  // A handful of evenly spaced date labels along the x-axis.
  const tickCount = Math.min(6, n)
  const ticks =
    tickCount > 1
      ? Array.from({ length: tickCount }, (_, k) => {
          const i = Math.round((k / (tickCount - 1)) * (n - 1))
          return { i, date: data[i]?.date ?? "" }
        })
      : []

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">Traffic &amp; leads</CardTitle>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Visitors
            <span className="text-muted-foreground">
              (peak {maxVisitors.toLocaleString()})
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            Leads
            <span className="text-muted-foreground">(peak {maxLeads})</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No traffic recorded for this range yet.
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-label="Visitors and leads over time"
            >
              <defs>
                <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              {visitorArea ? (
                <polygon points={visitorArea} fill="url(#visitorFill)" />
              ) : null}
              <polyline
                points={visitorLine.join(" ")}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polyline
                points={leadLine}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="1 0"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
              {ticks.map((tick) => (
                <span key={tick.i}>{formatTick(tick.date)}</span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function formatTick(date: string) {
  // date is YYYY-MM-DD; show "M/D" without timezone shifting.
  const [, m, d] = date.split("-")
  return m && d ? `${Number(m)}/${Number(d)}` : date
}
