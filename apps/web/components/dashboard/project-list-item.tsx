import Image from "next/image"
import Link from "next/link"
import { Building2Icon, LayersIcon, MapPinIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { DirhamSymbol } from "@workspace/ui/components/dirham-symbol"

import { InventoryFreshnessBadge } from "@/components/projects/inventory-freshness-badge"
import { StatusBadge } from "@/components/status-badge"
import type { ProjectCard as ProjectCardData } from "@/lib/data/projects"
import type { PlainUnitType } from "@/lib/data/serialize"
import {
  formatPaymentPlanShort,
  formatPrice,
  formatUnitTypeName,
} from "@/lib/format"
import { FavoriteButton } from "./favorite-button"
import { ProjectListToggles } from "./project-list-toggles"

function inventoryBreakdown(unitTypes: PlainUnitType[]) {
  const totals = new Map<
    string,
    { propertyType: PlainUnitType["propertyType"]; bedrooms: number | null; count: number }
  >()
  for (const unit of unitTypes) {
    const key = `${unit.propertyType}:${unit.bedrooms ?? ""}`
    const existing = totals.get(key)
    if (existing) {
      existing.count += unit.unitCount ?? 0
    } else {
      totals.set(key, {
        propertyType: unit.propertyType,
        bedrooms: unit.bedrooms,
        count: unit.unitCount ?? 0,
      })
    }
  }
  return Array.from(totals.values())
}

export function ProjectListItem({ project }: { project: ProjectCardData }) {
  const breakdown = inventoryBreakdown(project.unitTypes)

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="flex-col gap-0 overflow-hidden p-0 transition-all hover:shadow-md sm:flex-row sm:items-stretch">
        <div className="relative h-28 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-44">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              sizes="(min-width: 640px) 176px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Building2Icon className="size-7 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5">
            <StatusBadge
              status={project.status}
              variant="solid"
              className="text-[10px]"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-start gap-1 p-3 sm:flex-1 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold">{project.name}</p>
            <FavoriteButton
              projectId={project.id}
              isFavorite={project.isFavorite}
            />
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {project.developer}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPinIcon className="size-3 shrink-0" />
            {project.location}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-3 py-2 sm:w-40 sm:shrink-0 sm:flex-col sm:items-start sm:justify-start sm:gap-1 sm:border-t-0 sm:border-l sm:px-4 sm:py-4">
          <p className="text-xs text-muted-foreground">Starting Price</p>
          <p className="flex items-center gap-0.5 text-base font-semibold text-primary sm:text-lg">
            <DirhamSymbol />
            {formatPrice(project.startingPrice) ?? "—"}
          </p>
        </div>

        <div className="hidden min-w-0 flex-col items-start justify-start gap-1 border-l border-border px-4 py-4 sm:flex sm:w-40 sm:shrink-0">
          <p className="text-xs text-muted-foreground">Payment Plan</p>
          <p className="truncate text-base font-semibold sm:text-lg">
            {formatPaymentPlanShort(project.paymentPlan) ?? "—"}
          </p>
          {project.promoPaymentPlan && (
            <Badge className="h-4.5 border-none bg-accent px-1.5 text-[10px] text-accent-foreground">
              Promo {formatPaymentPlanShort(project.promoPaymentPlan)}
            </Badge>
          )}
        </div>

        <div className="hidden min-w-0 flex-col items-start justify-start gap-1.5 border-l border-border px-4 py-4 sm:flex sm:w-56 sm:shrink-0">
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <LayersIcon className="size-3" />
              Inventory
            </p>
            <p className="text-base font-semibold sm:text-lg">
              {project.totalUnitCount != null
                ? `${project.totalUnitCount} units`
                : "—"}
            </p>
          </div>
          {breakdown.length > 0 && (
            <div className="flex w-full flex-col gap-0.5">
              {breakdown.map(({ propertyType, bedrooms, count }) => (
                <div
                  key={`${propertyType}:${bedrooms ?? ""}`}
                  className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
                >
                  <span>{formatUnitTypeName(propertyType, bedrooms)}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
          <InventoryFreshnessBadge
            inventoryUpdatedAt={project.inventoryUpdatedAt}
            className="h-4.5 px-1.5 text-[10px]"
          />
        </div>

        <ProjectListToggles
          projectId={project.id}
          isPublished={project.isPublished}
          isHot={project.isHot}
        />
      </Card>
    </Link>
  )
}
