import Image from "next/image"
import { BookOpenIcon, SquareStackIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { FavoriteButton } from "@/components/dashboard/favorite-button"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { DuplicateProjectButton } from "@/components/projects/duplicate-project-button"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { ExportProjectButton } from "@/components/projects/export-project-button"
import { StatusBadge } from "@/components/status-badge"
import { getCoverImageUrl, type PlainProject } from "@/lib/data/serialize"

export function ProjectHeader({ project }: { project: PlainProject }) {
  const coverImageUrl = getCoverImageUrl(project.attachments)

  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6">
      {coverImageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-64">
          <Image
            src={coverImageUrl}
            alt={project.name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <StatusBadge status={project.status} variant="solid" />
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <FavoriteButton
            projectId={project.id}
            isFavorite={project.isFavorite}
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.developer} · {project.location}
              {project.community ? ` (${project.community})` : ""}
            </p>
          </div>
        </div>
        {!coverImageUrl && (
          <StatusBadge status={project.status} className="text-sm" />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <ButtonLink
          variant="outline"
          size="sm"
          href={`/study?projectId=${project.id}`}
        >
          <BookOpenIcon /> Study
        </ButtonLink>
        <ButtonLink
          variant="outline"
          size="sm"
          href={`/flashcards?projectId=${project.id}`}
        >
          <SquareStackIcon /> Flashcards
        </ButtonLink>
        <EditProjectDialog projectId={project.id} defaultValues={project} />
        <DuplicateProjectButton projectId={project.id} />
        <ExportProjectButton
          projectId={project.id}
          projectName={project.name}
        />
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
        />
      </div>
    </div>
  )
}
