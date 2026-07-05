import Image from "next/image"
import Link from "next/link"
import { Building2Icon, LayersIcon, MapPinIcon } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"
import { DirhamSymbol } from "@workspace/ui/components/dirham-symbol"

import { StatusBadge } from "@/components/status-badge"
import type { ProjectCard as ProjectCardData } from "@/lib/data/projects"
import { formatAreaRange, formatPrice } from "@/lib/format"
import { FavoriteButton } from "./favorite-button"

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Building2Icon className="size-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
            <StatusBadge status={project.status} variant="solid" />
            <div className="rounded-full bg-background/85 backdrop-blur-sm">
              <FavoriteButton
                projectId={project.id}
                isFavorite={project.isFavorite}
              />
            </div>
          </div>
        </div>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{project.name}</p>
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {project.location}
            </p>
          </div>

          <div className="flex items-end justify-between gap-2 border-t border-border pt-3">
            <div>
              <p className="text-xs text-muted-foreground">Starting Price</p>
              <p className="flex items-center gap-0.5 text-lg font-semibold text-primary">
                <DirhamSymbol />
                {formatPrice(project.startingPrice) ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <LayersIcon className="size-3.5" />
              {project.unitTypeCount}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Developer</p>
              <p className="truncate text-sm font-medium">{project.developer}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Payment Plan</p>
              <p className="truncate text-sm font-medium">
                {project.paymentPlan ?? "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">BUA</p>
              <p className="truncate text-sm font-medium">
                {formatAreaRange(project.buaRange) ?? "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Plot</p>
              <p className="truncate text-sm font-medium">
                {formatAreaRange(project.plotSizeRange) ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
