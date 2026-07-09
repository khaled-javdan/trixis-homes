import { Building2Icon, LayersIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"

type Stats = {
  totalProjects: number
  unitsFound: number
}

export function StatsBar({ stats }: { stats: Stats }) {
  const tiles = [
    {
      label: "Total Projects",
      value: stats.totalProjects.toString(),
      icon: Building2Icon,
    },
    {
      label: "Units Found",
      value: stats.unitsFound.toString(),
      icon: LayersIcon,
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tiles.map((tile) => (
        <Badge key={tile.label} variant="secondary" className="gap-1.5 py-1">
          <tile.icon className="size-3" />
          {tile.label}: <span className="tabular-nums">{tile.value}</span>
        </Badge>
      ))}
    </div>
  )
}
