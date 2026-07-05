import { Card, CardContent } from "@workspace/ui/components/card"

import { NoteDeleteButton } from "@/components/projects/notes/note-delete-button"
import { NoteForm } from "@/components/projects/notes/note-form"
import { formatDateShort } from "@/lib/format"
import type { PlainNote } from "@/lib/data/serialize"

export function NotesPanel({
  projectId,
  notes,
}: {
  projectId: string
  notes: PlainNote[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <NoteForm projectId={projectId} />

      {notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No notes yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateShort(note.createdAt)}
                  </p>
                </div>
                <NoteDeleteButton noteId={note.id} projectId={projectId} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
