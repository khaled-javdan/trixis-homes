import type { ProjectStatus } from "@workspace/db"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { formatProjectStatus } from "@/lib/format"

const statusStyles: Record<ProjectStatus, string> = {
  OFF_PLAN:
    "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  UNDER_CONSTRUCTION:
    "border-blue-500/20 bg-blue-500/15 text-blue-700 dark:text-blue-400",
  READY:
    "border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

const statusSolidStyles: Record<ProjectStatus, string> = {
  OFF_PLAN: "bg-amber-500 text-white",
  UNDER_CONSTRUCTION: "bg-blue-500 text-white",
  READY: "bg-emerald-500 text-white",
}

export function StatusBadge({
  status,
  className,
  variant = "tint",
}: {
  status: ProjectStatus
  className?: string
  variant?: "tint" | "solid"
}) {
  return (
    <Badge
      variant={variant === "tint" ? "outline" : "default"}
      className={cn(
        variant === "tint" ? statusStyles[status] : statusSolidStyles[status],
        variant === "solid" && "border-none shadow-sm",
        className
      )}
    >
      {formatProjectStatus(status)}
    </Badge>
  )
}
