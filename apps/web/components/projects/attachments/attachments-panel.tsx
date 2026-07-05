import Image from "next/image"
import { FileTextIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"

import { AttachmentDeleteButton } from "@/components/projects/attachments/attachment-delete-button"
import { UploadDropzone } from "@/components/projects/attachments/upload-dropzone"
import { formatDateShort } from "@/lib/format"
import type { PlainAttachment } from "@/lib/data/serialize"

const categoryLabels: Record<PlainAttachment["category"], string> = {
  BROCHURE: "Brochure",
  FLOOR_PLAN: "Floor Plan",
  IMAGE: "Image",
  PRICE_LIST: "Price List",
  OTHER: "Other",
}

export function AttachmentsPanel({
  projectId,
  attachments,
}: {
  projectId: string
  attachments: PlainAttachment[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <UploadDropzone projectId={projectId} />

      {attachments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No attachments yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => {
            const isImage = attachment.contentType.startsWith("image/")
            return (
              <Card key={attachment.id} className="gap-0 overflow-hidden p-0">
                {isImage && (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block aspect-video w-full overflow-hidden bg-muted"
                  >
                    <Image
                      src={attachment.url}
                      alt={attachment.filename}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </a>
                )}
                <CardContent className="flex items-start gap-3 px-4 py-3">
                  {!isImage && (
                    <FileTextIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {attachment.filename}
                    </a>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">
                        {categoryLabels[attachment.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateShort(attachment.uploadedAt)}
                      </span>
                    </div>
                  </div>
                  <AttachmentDeleteButton
                    attachmentId={attachment.id}
                    projectId={projectId}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
