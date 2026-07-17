"use client"

import { PlusIcon, SearchXIcon } from "lucide-react"

import { useIsAdmin } from "@/components/admin-provider"
import { ButtonLink } from "@/components/button-link"

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const isAdmin = useIsAdmin()

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
            : isAdmin
              ? "Get started by adding your first project."
              : "No projects have been added yet."}
        </p>
      </div>
      {!hasFilters && isAdmin && (
        <ButtonLink href="/projects/new" className="mt-2">
          <PlusIcon /> New Project
        </ButtonLink>
      )}
    </div>
  )
}
