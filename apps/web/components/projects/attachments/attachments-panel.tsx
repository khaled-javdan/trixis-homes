import Image from "next/image"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { AttachmentCoverButton } from "@/components/projects/attachments/attachment-cover-button"
import { AttachmentDeleteButton } from "@/components/projects/attachments/attachment-delete-button"
import { UploadDropzone } from "@/components/projects/attachments/upload-dropzone"
import { attachmentCategoryMeta } from "@/lib/attachment-categories"
import { formatDateShort, formatFileSize } from "@/lib/format"
import type { PlainAttachment } from "@/lib/data/serialize"

export function AttachmentsPanel({
  projectId,
  attachments,
}: {
  projectId: string
  attachments: PlainAttachment[]
}) {
  const photos = attachments.filter((attachment) =>
    attachment.contentType.startsWith("image/")
  )
  const documents = attachments.filter(
    (attachment) => !attachment.contentType.startsWith("image/")
  )
  const coverAttachmentId =
    photos.find((photo) => photo.isCover)?.id ??
    [...photos].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))[0]?.id ??
    null

  return (
    <div className="flex flex-col gap-6">
      <UploadDropzone projectId={projectId} />

      {attachments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No attachments yet.
        </p>
      ) : (
        <>
          {photos.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0"
                    >
                      <Image
                        src={attachment.url}
                        alt={attachment.filename}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </a>
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate p-2 text-xs font-medium text-white">
                        {attachment.filename}
                      </p>
                    </div>
                    {attachment.id === coverAttachmentId && (
                      <Badge className="pointer-events-none absolute top-1.5 left-1.5">
                        Cover
                      </Badge>
                    )}
                    <div
                      className={cn(
                        "pointer-events-auto absolute top-1.5 right-1.5 flex items-center gap-1 transition-opacity",
                        attachment.id === coverAttachmentId
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <AttachmentCoverButton
                        attachmentId={attachment.id}
                        projectId={projectId}
                        isCover={attachment.id === coverAttachmentId}
                        className="bg-black/50 text-white hover:bg-black/70 hover:text-white"
                      />
                      <AttachmentDeleteButton
                        attachmentId={attachment.id}
                        projectId={projectId}
                        filename={attachment.filename}
                        className="bg-black/50 text-white hover:bg-black/70 hover:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {documents.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Documents ({documents.length})
              </h3>
              <div className="flex flex-col overflow-hidden rounded-lg border border-border">
                {documents.map((attachment, index) => {
                  const meta = attachmentCategoryMeta[attachment.category]
                  const Icon = meta.icon
                  return (
                    <div
                      key={attachment.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                        index > 0 && "border-t border-border"
                      )}
                    >
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <Icon className="size-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium hover:underline">
                            {attachment.filename}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="h-4.5">
                              {meta.label}
                            </Badge>
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>·</span>
                            <span>
                              {formatDateShort(attachment.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </a>
                      <AttachmentDeleteButton
                        attachmentId={attachment.id}
                        projectId={projectId}
                        filename={attachment.filename}
                        className="shrink-0"
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
