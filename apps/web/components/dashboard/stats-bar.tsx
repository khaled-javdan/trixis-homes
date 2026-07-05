import { Building2Icon, ClockIcon, LayersIcon, StarIcon } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { formatRelativeToNow } from "@/lib/format"

type Stats = {
  totalProjects: number
  totalUnitTypes: number
  favoriteProjects: number
  lastUpdated: string | null
}

export function StatsBar({ stats }: { stats: Stats }) {
  const tiles = [
    {
      label: "Total Projects",
      value: stats.totalProjects.toString(),
      icon: Building2Icon,
      accent: "bg-primary/10 text-primary",
    },
    {
      label: "Total Unit Types",
      value: stats.totalUnitTypes.toString(),
      icon: LayersIcon,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Favorite Projects",
      value: stats.favoriteProjects.toString(),
      icon: StarIcon,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Last Updated",
      value: stats.lastUpdated
        ? (formatRelativeToNow(stats.lastUpdated) ?? "—")
        : "—",
      icon: ClockIcon,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} size="sm">
          <CardContent className="flex items-center gap-2.5 px-3.5 py-2">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                tile.accent
              )}
            >
              <tile.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {tile.label}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">
                {tile.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
