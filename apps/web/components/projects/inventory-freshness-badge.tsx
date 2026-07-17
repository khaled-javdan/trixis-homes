import { ClockIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { formatRelativeToNow } from "@/lib/format"

export function InventoryFreshnessBadge({
  inventoryUpdatedAt,
  className,
}: {
  inventoryUpdatedAt: string | null
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-muted-foreground", className)}
    >
      <ClockIcon className="size-3" />
      {inventoryUpdatedAt
        ? `Inventory updated ${formatRelativeToNow(inventoryUpdatedAt)}`
        : "Inventory not updated yet"}
    </Badge>
  )
}
