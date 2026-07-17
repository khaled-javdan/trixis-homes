"use client"

import * as React from "react"
import { upload } from "@vercel/blob/client"
import {
  AlertCircleIcon,
  ImagePlusIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { createAttachmentRecord } from "@/lib/actions/attachments"
import type { AttachmentInput } from "@workspace/db/validation/attachment"

const imageAccept = "image/png,image/jpeg,image/webp,image/gif"
const documentAccept = `application/pdf,${imageAccept}`

type UploadTask = {
  id: string
  name: string
  progress: number
  status: "uploading" | "error"
  error?: string
}

/** Upload control pinned to a single attachment category. Rendered as a
 * square tile inside image grids, or as a dashed row under document lists. */
export function CategoryUpload({
  projectId,
  category,
  variant,
  label,
}: {
  projectId: string
  category: AttachmentInput["category"]
  variant: "tile" | "row"
  label: string
}) {
  const isAdmin = useIsAdmin()
  const [isDragging, setIsDragging] = React.useState(false)
  const [tasks, setTasks] = React.useState<UploadTask[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const accept = category === "IMAGE" ? imageAccept : documentAccept

  function updateTask(id: string, patch: Partial<UploadTask>) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...patch } : task))
    )
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const incoming = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }))

    setTasks((prev) => [
      ...prev,
      ...incoming.map(({ id, file }) => ({
        id,
        name: file.name,
        progress: 0,
        status: "uploading" as const,
      })),
    ])

    await Promise.all(
      incoming.map(async ({ file, id }) => {
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/attachments/upload",
            clientPayload: JSON.stringify({ projectId, category }),
            onUploadProgress: ({ percentage }) =>
              updateTask(id, { progress: percentage }),
          })
          await createAttachmentRecord({
            projectId,
            filename: file.name,
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            size: file.size,
            category,
          })
          setTasks((prev) => prev.filter((task) => task.id !== id))
        } catch (error) {
          updateTask(id, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          })
        }
      })
    )

    if (inputRef.current) inputRef.current.value = ""
  }

  if (!isAdmin) return null

  const dropHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      void handleFiles(event.dataTransfer.files)
    },
  }

  const uploadingTasks = tasks.filter((task) => task.status === "uploading")

  return (
    <>
      {variant === "tile" ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...dropHandlers}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-center text-xs text-muted-foreground transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
          )}
        >
          <ImagePlusIcon
            className={cn(
              "size-5",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
          {uploadingTasks.length
            ? `Uploading ${uploadingTasks.length}…`
            : label}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          {...dropHandlers}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
          )}
        >
          <UploadCloudIcon
            className={cn(
              "size-4",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
          {uploadingTasks.length
            ? `Uploading ${uploadingTasks.length}…`
            : label}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={accept}
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {tasks.length > 0 && (
        <div className={cn("flex flex-col gap-2", variant === "tile" && "col-span-full")}>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{task.name}</p>
                {task.status === "uploading" && (
                  <Progress value={task.progress} className="mt-1.5 h-1.5" />
                )}
                {task.status === "error" && (
                  <p className="mt-0.5 truncate text-xs text-destructive">
                    {task.error}
                  </p>
                )}
              </div>
              {task.status === "uploading" && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {Math.round(task.progress)}%
                </span>
              )}
              {task.status === "error" && (
                <>
                  <AlertCircleIcon className="size-4 shrink-0 text-destructive" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Dismiss"
                    onClick={() =>
                      setTasks((prev) => prev.filter((t) => t.id !== task.id))
                    }
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
