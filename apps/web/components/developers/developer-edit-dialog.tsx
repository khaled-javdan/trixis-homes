"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { ImageIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import { updateDeveloper } from "@/lib/actions/developers"
import type { DeveloperRow } from "@/lib/data/developers"

export function DeveloperEditDialog({ developer }: { developer: DeveloperRow }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, startSaving] = React.useTransition()
  const [uploading, setUploading] = React.useState(false)

  const [name, setName] = React.useState(developer.name)
  const [description, setDescription] = React.useState(developer.description ?? "")
  const [coverImageUrl, setCoverImageUrl] = React.useState(
    developer.coverImageUrl ?? ""
  )
  const [websiteUrl, setWebsiteUrl] = React.useState(developer.websiteUrl ?? "")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function resetForm() {
    setName(developer.name)
    setDescription(developer.description ?? "")
    setCoverImageUrl(developer.coverImageUrl ?? "")
    setWebsiteUrl(developer.websiteUrl ?? "")
  }

  async function handleCoverFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/attachments/upload",
      })
      setCoverImageUrl(blob.url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleSave() {
    startSaving(async () => {
      try {
        await updateDeveloper(developer.id, {
          name,
          description,
          coverImageUrl,
          logoUrl: developer.logoUrl ?? "",
          websiteUrl,
        })
        toast.success("Developer updated")
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update developer"
        )
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PencilIcon /> Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {developer.name}</DialogTitle>
          <DialogDescription>
            Shown on the public developers page. The cover image appears on the
            developer&apos;s card; the description is the write-up beneath it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="developer-name">Name</Label>
            <Input
              id="developer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Cover image</Label>
            {coverImageUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={coverImageUrl}
                  alt={`${developer.name} cover`}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="absolute right-2 top-2"
                  aria-label="Remove cover image"
                  onClick={() => setCoverImageUrl("")}
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-[16/9] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/40"
              >
                {uploading ? (
                  <Loader2Icon className="size-5 animate-spin" />
                ) : (
                  <ImageIcon className="size-5" />
                )}
                {uploading ? "Uploading…" : "Click to upload a cover image"}
              </button>
            )}
            {coverImageUrl ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <ImageIcon />
                )}
                Replace image
              </Button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => void handleCoverFile(event.target.files)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="developer-description">Description</Label>
            <Textarea
              id="developer-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              placeholder="A few sentences about this developer — track record, flagship communities, what makes them worth buying from."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="developer-website">Website (optional)</Label>
            <Input
              id="developer-website"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploading || !name.trim()}
          >
            {saving ? <Loader2Icon className="animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
