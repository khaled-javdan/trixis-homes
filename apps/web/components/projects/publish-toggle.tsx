"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FlameIcon,
  GlobeIcon,
  GlobeLockIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { useIsAdmin } from "@/components/admin-provider"
import { setProjectHot, setProjectPublished } from "@/lib/actions/projects"

export function HotToggle({
  projectId,
  isHot,
}: {
  projectId: string
  isHot: boolean
}) {
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  if (!isAdmin) return null

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await setProjectHot(projectId, !isHot)
            toast.success(
              isHot
                ? "Removed from the home-page slider"
                : "Featured in the home-page slider"
            )
            router.refresh()
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to update hot status"
            )
          }
        })
      }}
    >
      <FlameIcon
        className={cn(isHot && "fill-orange-500 text-orange-500")}
      />
      {isHot ? "Hot" : "Mark as Hot"}
    </Button>
  )
}

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
