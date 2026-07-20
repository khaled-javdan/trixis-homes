"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { reorderProjects } from "@/lib/actions/projects"
import type { ProjectCard as ProjectCardData } from "@/lib/data/projects"
import { ProjectListItem } from "./project-list-item"

/**
 * List view with owner drag-to-reorder, built on @dnd-kit. Dragging starts from
 * a grip handle (so the project card stays a normal link) and supports mouse,
 * touch, and keyboard. The new order is persisted optimistically. Non-owners
 * get a plain, non-draggable list.
 */
export function SortableProjectList({
  projects,
}: {
  projects: ProjectCardData[]
}) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const [items, setItems] = React.useState(projects)
  const [, startTransition] = React.useTransition()

  // Re-sync when the server list changes (add/delete/filter/refresh) without an
  // effect — the React-recommended "adjust state during render" pattern.
  const [syncedProjects, setSyncedProjects] = React.useState(projects)
  if (projects !== syncedProjects) {
    setSyncedProjects(projects)
    setItems(projects)
  }

  const sensors = useSensors(
    // A small distance threshold so a click on the handle still navigates and
    // only a deliberate drag starts sorting.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </div>
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const from = items.findIndex((project) => project.id === active.id)
    const to = items.findIndex((project) => project.id === over.id)
    if (from === -1 || to === -1) return

    const next = arrayMove(items, from, to)
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((project) => project.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-3">
          {items.map((project) => (
            <SortableRow key={project.id} project={project} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ project }: { project: ProjectCardData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-stretch gap-1 rounded-lg",
        isDragging && "relative z-10 opacity-80 shadow-lg"
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={`Drag ${project.name} to reorder`}
        title="Drag to reorder"
        className="flex w-6 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <ProjectListItem project={project} />
      </div>
    </li>
  )
}
