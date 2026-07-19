import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
]

export function RangePicker({ current }: { current: number }) {
  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {RANGES.map((range) => (
        <Link
          key={range.days}
          href={`/analytics?range=${range.days}`}
          className={cn(
            "rounded-sm px-3 py-1 text-sm transition-colors",
            current === range.days
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {range.label}
        </Link>
      ))}
    </div>
  )
}
