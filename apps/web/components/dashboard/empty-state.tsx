import { PlusIcon, SearchXIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchXIcon className="size-5 text-muted-foreground" />
      </span>
      <div>
        <p className="font-medium">No projects found</p>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "Try adjusting your search or filters."
            : "Get started by adding your first project."}
        </p>
      </div>
      {!hasFilters && (
        <ButtonLink href="/projects/new" className="mt-2">
          <PlusIcon /> New Project
        </ButtonLink>
      )}
    </div>
  )
}
