"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { setCoverAttachment } from "@/lib/actions/attachments"

export function AttachmentCoverButton({
  attachmentId,
  projectId,
  isCover,
  className,
}: {
  attachmentId: string
  projectId: string
  isCover: boolean
  className?: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isCover ? "Cover photo" : "Set as cover"}
      aria-pressed={isCover}
      disabled={pending || isCover}
      className={className}
      onClick={(event) => {
        event.preventDefault()
        startTransition(async () => {
          try {
            await setCoverAttachment(attachmentId, projectId)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to set cover photo"
            )
          }
        })
      }}
    >
      <StarIcon className={cn("size-3.5", isCover && "fill-current")} />
    </Button>
  )
}
