import Image from "next/image"

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import { AttachmentCoverButton } from "@/components/projects/attachments/attachment-cover-button"
import { AttachmentDeleteButton } from "@/components/projects/attachments/attachment-delete-button"
import { CategoryUpload } from "@/components/projects/attachments/category-upload"
import { attachmentCategoryMeta } from "@/lib/attachment-categories"
import { formatDateShort, formatFileSize } from "@/lib/format"
import type { PlainAttachment } from "@/lib/data/serialize"

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function PhotoTile({
  attachment,
  projectId,
  isCover,
  showCoverActions,
}: {
  attachment: PlainAttachment
  projectId: string
  isCover: boolean
  showCoverActions: boolean
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-muted ring-1 ring-border",
        isCover ? "aspect-video" : "aspect-square"
      )}
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
      {isCover && (
        <Badge className="pointer-events-none absolute top-1.5 left-1.5">
          Cover
        </Badge>
      )}
      <div
        className={cn(
          "pointer-events-auto absolute top-1.5 right-1.5 flex items-center gap-1 transition-opacity",
          isCover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {showCoverActions && (
          <AttachmentCoverButton
            attachmentId={attachment.id}
            projectId={projectId}
            isCover={isCover}
            className="bg-black/50 text-white hover:bg-black/70 hover:text-white"
          />
        )}
        <AttachmentDeleteButton
          attachmentId={attachment.id}
          projectId={projectId}
          filename={attachment.filename}
          className="bg-black/50 text-white hover:bg-black/70 hover:text-white"
        />
      </div>
    </div>
  )
}

function DocumentSection({
  projectId,
  category,
  title,
  hint,
  uploadLabel,
  documents,
}: {
  projectId: string
  category: PlainAttachment["category"]
  title: string
  hint: string
  uploadLabel: string
  documents: PlainAttachment[]
}) {
  const meta = attachmentCategoryMeta[category]
  const Icon = meta.icon

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} hint={hint} />
      {documents.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border">
          {documents.map((attachment, index) => (
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
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>·</span>
                    <span>{formatDateShort(attachment.uploadedAt)}</span>
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
          ))}
        </div>
      )}
      <CategoryUpload
        projectId={projectId}
        category={category}
        variant="row"
        label={uploadLabel}
      />
    </section>
  )
}

export function AttachmentsPanel({
  projectId,
  attachments,
}: {
  projectId: string
  attachments: PlainAttachment[]
}) {
  const byCategory = (category: PlainAttachment["category"]) =>
    attachments.filter((attachment) => attachment.category === category)

  const images = byCategory("IMAGE")
  const cover =
    images.find((image) => image.isCover) ??
    [...images].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))[0] ??
    null
  const gallery = images.filter((image) => image.id !== cover?.id)

  return (
    <div className="flex flex-col gap-8">
      {/* Cover */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Cover image"
          hint="The hero image on the public project page, project cards, and the hot-projects slider."
        />
        {cover ? (
          <div className="max-w-md">
            <PhotoTile
              attachment={cover}
              projectId={projectId}
              isCover
              showCoverActions={images.length > 1}
            />
          </div>
        ) : (
          <div className="grid max-w-md">
            <CategoryUpload
              projectId={projectId}
              category="IMAGE"
              variant="row"
              label="Upload a cover image"
            />
          </div>
        )}
      </section>

      {/* Gallery */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Gallery"
          hint="Shown in the public page's gallery section. Hover a photo to make it the cover instead."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((attachment) => (
            <PhotoTile
              key={attachment.id}
              attachment={attachment}
              projectId={projectId}
              isCover={false}
              showCoverActions
            />
          ))}
          <CategoryUpload
            projectId={projectId}
            category="IMAGE"
            variant="tile"
            label="Add photos"
          />
        </div>
      </section>

      <DocumentSection
        projectId={projectId}
        category="BROCHURE"
        title="Brochures"
        hint='Unlocks the "Download Brochure" buttons on the public page — sent to visitors after they leave their contact details.'
        uploadLabel="Upload brochure (PDF or image)"
        documents={byCategory("BROCHURE")}
      />

      <DocumentSection
        projectId={projectId}
        category="FLOOR_PLAN"
        title="Floor plans"
        hint='Unlocks "Get Floor Plans" on the public page, gated behind the lead form.'
        uploadLabel="Upload floor plans (PDF or image)"
        documents={byCategory("FLOOR_PLAN")}
      />

      <DocumentSection
        projectId={projectId}
        category="PRICE_LIST"
        title="Price lists"
        hint='Unlocks "Get Price List" on the public page, gated behind the lead form.'
        uploadLabel="Upload price list (PDF or image)"
        documents={byCategory("PRICE_LIST")}
      />

      <DocumentSection
        projectId={projectId}
        category="OTHER"
        title="Other files"
        hint="Internal documents — never shown on the public site."
        uploadLabel="Upload file (PDF or image)"
        documents={byCategory("OTHER")}
      />
    </div>
  )
}
