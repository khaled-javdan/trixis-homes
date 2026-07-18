"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Switch } from "@workspace/ui/components/switch"
import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { setProjectHot, setProjectPublished } from "@/lib/actions/projects"

/** Inline publish/hot toggles for a dashboard list row. Renders nothing for
 * non-admins, and stops clicks from bubbling to the row's <Link>. */
export function ProjectListToggles({
  projectId,
  isPublished,
  isHot,
}: {
  projectId: string
  isPublished: boolean
  isHot: boolean
}) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  if (!isAdmin) return null

  function handlePublish(next: boolean) {
    startTransition(async () => {
      try {
        await setProjectPublished(projectId, next)
        toast.success(
          next ? "Published to the public site" : "Removed from the public site"
        )
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update publish state"
        )
      }
    })
  }

  function handleHot(next: boolean) {
    startTransition(async () => {
      try {
        await setProjectHot(projectId, next)
        toast.success(
          next
            ? "Featured in the home-page slider"
            : "Removed from the home-page slider"
        )
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update hot status"
        )
      }
    })
  }

  return (
    <div
      // Keep toggle interactions from triggering the row's link navigation.
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      className="flex shrink-0 flex-row items-center justify-start gap-4 border-t border-border px-3 py-2 sm:w-40 sm:flex-col sm:items-start sm:gap-2 sm:border-t-0 sm:border-l sm:px-4 sm:py-4"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Switch
          size="sm"
          checked={isPublished}
          disabled={pending}
          onCheckedChange={handlePublish}
          aria-label={isPublished ? "Unpublish project" : "Publish project"}
        />
        {isPublished ? "Published" : "Unpublished"}
      </div>
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-medium text-muted-foreground",
          !isPublished && "opacity-50"
        )}
      >
        <Switch
          size="sm"
          checked={isHot}
          disabled={pending || !isPublished}
          onCheckedChange={handleHot}
          aria-label={isHot ? "Remove from hot slider" : "Mark as hot"}
        />
        {isHot ? "Hot" : "Mark Hot"}
      </div>
    </div>
  )
}
