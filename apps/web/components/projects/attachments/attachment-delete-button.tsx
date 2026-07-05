"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { deleteAttachment } from "@/lib/actions/attachments"

export function AttachmentDeleteButton({
  attachmentId,
  projectId,
}: {
  attachmentId: string
  projectId: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete attachment"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await deleteAttachment(attachmentId, projectId)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to delete attachment"
            )
          }
        })
      }}
    >
      <Trash2Icon className="size-3.5" />
    </Button>
  )
}
