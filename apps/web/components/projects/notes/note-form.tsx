"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"

import { createNote } from "@/lib/actions/notes"

export function NoteForm({ projectId }: { projectId: string }) {
  const [body, setBody] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  function submit() {
    if (!body.trim()) return
    startTransition(async () => {
      try {
        await createNote(projectId, { body })
        setBody("")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add note"
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault()
            submit()
          }
        }}
        placeholder="Add a sales tip, comparison, or client objection… (⌘/Ctrl + Enter to save)"
        rows={3}
      />
      <div className="flex justify-end">
        <Button size="sm" disabled={pending || !body.trim()} onClick={submit}>
          {pending ? "Saving…" : "Add Note"}
        </Button>
      </div>
    </div>
  )
}
