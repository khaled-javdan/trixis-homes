"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { toggleFavorite } from "@/lib/actions/projects"

export function FavoriteButton({
  projectId,
  isFavorite,
}: {
  projectId: string
  isFavorite: boolean
}) {
  const isAdmin = useIsAdmin()
  const [optimisticFavorite, setOptimisticFavorite] =
    React.useOptimistic(isFavorite)
  const [, startTransition] = React.useTransition()

  // Viewers see the favorite state but can't toggle it.
  if (!isAdmin) {
    return (
      <span
        aria-label={isFavorite ? "Favorite project" : undefined}
        className="inline-flex size-7 items-center justify-center"
      >
        <StarIcon
          className={cn(
            "size-4",
            isFavorite
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/50"
          )}
        />
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={optimisticFavorite}
      aria-label={optimisticFavorite ? "Unstar project" : "Star project"}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const next = !optimisticFavorite
        startTransition(async () => {
          setOptimisticFavorite(next)
          await toggleFavorite(projectId, next)
        })
      }}
    >
      <StarIcon
        className={cn(
          "size-4 transition-colors",
          optimisticFavorite
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground"
        )}
      />
    </Button>
  )
}
