import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { DimensionRow } from "@/lib/analytics/vercel"

export function TopList({
  title,
  rows,
  metric = "visitors",
  emptyLabel = "No data yet",
}: {
  title: string
  rows: DimensionRow[]
  metric?: "visitors" | "pageviews"
  emptyLabel?: string
}) {
  const max = Math.max(1, ...rows.map((row) => row[metric]))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.label} className="relative">
                {/* Proportional bar sits behind the label as a subtle gauge. */}
                <div
                  className="absolute inset-y-0 left-0 rounded-sm bg-primary/10"
                  style={{ width: `${(row[metric] / max) * 100}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between gap-3 px-2 py-1">
                  <span className="truncate text-sm" title={row.label}>
                    {row.label}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {row[metric].toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
