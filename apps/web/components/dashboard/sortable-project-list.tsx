"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GripVerticalIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { reorderProjects } from "@/lib/actions/projects"
import type { ProjectCard as ProjectCardData } from "@/lib/data/projects"
import { ProjectListItem } from "./project-list-item"

/**
 * List view with owner drag-to-reorder. Uses native HTML5 drag from a grip
 * handle (so the project card stays a normal link) and persists the new order
 * optimistically. Non-owners get a plain, non-draggable list.
 */
export function SortableProjectList({
  projects,
}: {
  projects: ProjectCardData[]
}) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const [items, setItems] = React.useState(projects)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  const [, startTransition] = React.useTransition()

  // Re-sync when the server list changes (add/delete/filter/refresh) without an
  // effect — the React-recommended "adjust state during render" pattern.
  const [syncedProjects, setSyncedProjects] = React.useState(projects)
  if (projects !== syncedProjects) {
    setSyncedProjects(projects)
    setItems(projects)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </div>
    )
  }

  function reset() {
    setDraggingId(null)
    setOverId(null)
  }

  function persist(next: ProjectCardData[]) {
    const previous = items
    setItems(next)
    startTransition(async () => {
      try {
        await reorderProjects(next.map((project) => project.id))
        router.refresh()
      } catch {
        setItems(previous)
        toast.error("Couldn't save the new order")
      }
    })
  }

  function handleDrop(targetId: string) {
    const from = items.findIndex((project) => project.id === draggingId)
    const to = items.findIndex((project) => project.id === targetId)
    reset()
    if (from === -1 || to === -1 || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    persist(next)
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((project) => (
        <li
          key={project.id}
          onDragOver={(event) => {
            event.preventDefault()
            if (draggingId && overId !== project.id) setOverId(project.id)
          }}
          onDrop={(event) => {
            event.preventDefault()
            handleDrop(project.id)
          }}
          className={cn(
            "flex items-stretch gap-1 rounded-lg transition-[opacity,box-shadow]",
            draggingId === project.id && "opacity-40",
            overId === project.id &&
              draggingId &&
              draggingId !== project.id &&
              "ring-2 ring-primary/50"
          )}
        >
          <div
            draggable
            onDragStart={(event) => {
              setDraggingId(project.id)
              event.dataTransfer.effectAllowed = "move"
            }}
            onDragEnd={reset}
            role="button"
            aria-label={`Drag ${project.name} to reorder`}
            title="Drag to reorder"
            className="flex w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <ProjectListItem project={project} />
          </div>
        </li>
      ))}
    </ul>
  )
}
