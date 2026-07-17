"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GlobeIcon, GlobeLockIcon, SquareArrowOutUpRightIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { useIsAdmin } from "@/components/admin-provider"
import { setProjectPublished } from "@/lib/actions/projects"

export function PublishToggle({
  projectId,
  isPublished,
  slug,
  marketingUrl,
}: {
  projectId: string
  isPublished: boolean
  slug: string | null
  marketingUrl: string
}) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const publicUrl = slug ? `${marketingUrl}/projects/${slug}` : null

  if (!isAdmin) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            try {
              await setProjectPublished(projectId, !isPublished)
              toast.success(
                isPublished
                  ? "Removed from the public site"
                  : "Published to the public site"
              )
              router.refresh()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to update publish state"
              )
            }
          })
        }}
      >
        {isPublished ? <GlobeLockIcon /> : <GlobeIcon />}
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      {isPublished && publicUrl ? (
        <Button
          variant="ghost"
          size="sm"
          render={
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          <SquareArrowOutUpRightIcon />
          View public page
        </Button>
      ) : null}
    </>
  )
}
