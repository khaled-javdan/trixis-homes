import Image from "next/image"

import { FavoriteButton } from "@/components/dashboard/favorite-button"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { DuplicateProjectButton } from "@/components/projects/duplicate-project-button"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { ExportProjectButton } from "@/components/projects/export-project-button"
import { InventoryFreshnessBadge } from "@/components/projects/inventory-freshness-badge"
import { HotToggle, PublishToggle } from "@/components/projects/publish-toggle"
import { StatusBadge } from "@/components/status-badge"
import { getCoverImageUrl, type PlainProject } from "@/lib/data/serialize"

export function ProjectHeader({ project }: { project: PlainProject }) {
  const coverImageUrl = getCoverImageUrl(project.attachments)
  const marketingUrl =
    process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://trixishomes.com"

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {coverImageUrl && (
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-36">
              <Image
                src={coverImageUrl}
                alt={project.name}
                fill
                sizes="(min-width: 640px) 144px, 112px"
                priority
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.developer} · {project.location}
              {project.community ? ` (${project.community})` : ""}
            </p>
            <InventoryFreshnessBadge
              inventoryUpdatedAt={project.inventoryUpdatedAt}
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} className="text-sm" />
          <FavoriteButton
            projectId={project.id}
            isFavorite={project.isFavorite}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <EditProjectDialog projectId={project.id} defaultValues={project} />
        <DuplicateProjectButton projectId={project.id} />
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
        />
        <PublishToggle
          projectId={project.id}
          isPublished={project.isPublished}
          slug={project.slug}
          marketingUrl={marketingUrl}
        />
        {project.isPublished ? (
          <HotToggle projectId={project.id} isHot={project.isHot} />
        ) : null}
      </div>
    </div>
  )
}
