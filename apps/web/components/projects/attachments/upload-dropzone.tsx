"use client"

import * as React from "react"
import { upload } from "@vercel/blob/client"
import { AlertCircleIcon, CheckIcon, UploadCloudIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { createAttachmentRecord } from "@/lib/actions/attachments"
import { attachmentCategoryMeta } from "@/lib/attachment-categories"
import {
  attachmentCategoryValues,
  type AttachmentInput,
} from "@workspace/db/validation/attachment"

type UploadTask = {
  id: string
  name: string
  progress: number
  status: "uploading" | "done" | "error"
  error?: string
}

export function UploadDropzone({ projectId }: { projectId: string }) {
  const isAdmin = useIsAdmin()
  const [category, setCategory] =
    React.useState<AttachmentInput["category"]>("OTHER")
  const [isDragging, setIsDragging] = React.useState(false)
  const [tasks, setTasks] = React.useState<UploadTask[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

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
          updateTask(id, { status: "done", progress: 100 })
        } catch (error) {
          updateTask(id, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          })
        }
      })
    )

    if (inputRef.current) inputRef.current.value = ""
    setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.status !== "done"))
    }, 2000)
  }

  if (!isAdmin) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            void handleFiles(event.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={0}
          className={cn(
            "flex flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
          )}
        >
          <UploadCloudIcon
            className={cn(
              "size-6 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
          <p className="text-sm font-medium">
            {isDragging ? "Drop to upload" : "Drag & drop files, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG, WEBP, or GIF — multiple files supported
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:w-48 sm:shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            Upload as
          </span>
          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value as AttachmentInput["category"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attachmentCategoryValues.map((value) => {
                const meta = attachmentCategoryMeta[value]
                const Icon = meta.icon
                return (
                  <SelectItem key={value} value={value}>
                    <Icon className="size-4 text-muted-foreground" />
                    {meta.label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col gap-2">
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
              {task.status === "done" && (
                <CheckIcon className="size-4 shrink-0 text-emerald-600" />
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
    </div>
  )
}
