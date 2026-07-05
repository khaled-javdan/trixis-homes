"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { deleteNote } from "@/lib/actions/notes"

export function NoteDeleteButton({
  noteId,
  projectId,
}: {
  noteId: string
  projectId: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete note"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await deleteNote(noteId, projectId)
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Failed to delete note"
            )
          }
        })
      }}
    >
      <XIcon className="size-3.5" />
    </Button>
  )
}
