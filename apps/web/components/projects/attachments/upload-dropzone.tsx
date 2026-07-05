"use client"

import * as React from "react"
import { upload } from "@vercel/blob/client"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import { createAttachmentRecord } from "@/lib/actions/attachments"
import {
  attachmentCategoryValues,
  type AttachmentInput,
} from "@workspace/db/validation/attachment"

const categoryLabels: Record<
  (typeof attachmentCategoryValues)[number],
  string
> = {
  BROCHURE: "Brochure",
  FLOOR_PLAN: "Floor Plan",
  IMAGE: "Image",
  PRICE_LIST: "Price List",
  OTHER: "Other",
}

export function UploadDropzone({ projectId }: { projectId: string }) {
  const [category, setCategory] =
    React.useState<AttachmentInput["category"]>("OTHER")
  const [uploading, setUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/attachments/upload",
          clientPayload: JSON.stringify({ projectId, category }),
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
      }
      toast.success("Attachment uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        role="button"
        tabIndex={0}
        className={cn(
          "flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground transition-colors",
          isDragging ? "border-ring bg-muted" : "border-border"
        )}
      >
        <UploadIcon className="size-5" />
        <p>
          {uploading ? "Uploading…" : "Drag & drop a file, or click to browse"}
        </p>
        <p className="text-xs">PDF, PNG, JPG, WEBP, GIF</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      <Select
        value={category}
        onValueChange={(value) =>
          setCategory(value as AttachmentInput["category"])
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {attachmentCategoryValues.map((value) => (
            <SelectItem key={value} value={value}>
              {categoryLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
