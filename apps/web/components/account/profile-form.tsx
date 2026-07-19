"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { Loader2Icon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { UserAvatar } from "@/components/user-avatar"
import { updateOwnProfile } from "@/lib/actions/members"

type Profile = {
  name: string
  title: string
  phone: string
  avatarUrl: string
}

export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile
  email: string
}) {
  const router = useRouter()
  const [saving, startSaving] = React.useTransition()
  const [uploading, setUploading] = React.useState(false)

  const [name, setName] = React.useState(profile.name)
  const [title, setTitle] = React.useState(profile.title)
  const [phone, setPhone] = React.useState(profile.phone)
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatarUrl)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/attachments/upload",
      })
      setAvatarUrl(blob.url)
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
        await updateOwnProfile({ name, title, phone, avatarUrl })
        toast.success("Profile updated")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update profile"
        )
      }
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        handleSave()
      }}
    >
      <div className="flex items-center gap-4">
        <UserAvatar name={name} email={email} avatarUrl={avatarUrl} size="lg" />
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => handleFile(event.target.files)}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UploadIcon />
              )}
              {avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            {avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAvatarUrl("")}
              >
                <XIcon /> Remove
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG or WebP.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-title">Job title</Label>
          <Input
            id="profile-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Property Consultant"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+971 …"
          />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
