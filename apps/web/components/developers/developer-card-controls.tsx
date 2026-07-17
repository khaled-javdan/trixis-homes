"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import {
  deleteDeveloper,
  setDeveloperVisibility,
} from "@/lib/actions/developers"

export function DeveloperVisibilitySwitch({
  developerId,
  isVisible,
}: {
  developerId: string
  isVisible: boolean
}) {
  const router = useRouter()
  const [optimisticVisible, setOptimisticVisible] =
    React.useOptimistic(isVisible)
  const [, startTransition] = React.useTransition()
  const switchId = `developer-visible-${developerId}`

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={switchId}
        checked={optimisticVisible}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            setOptimisticVisible(checked)
            try {
              await setDeveloperVisibility(developerId, checked)
              router.refresh()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to update visibility"
              )
            }
          })
        }}
      />
      <Label
        htmlFor={switchId}
        className="text-xs font-normal text-muted-foreground"
      >
        {optimisticVisible ? "Shown on site" : "Hidden"}
      </Label>
    </div>
  )
}

export function DeleteDeveloperButton({
  developerId,
  developerName,
  projectCount,
}: {
  developerId: string
  developerName: string
  projectCount: number
}) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${developerName}`}
          />
        }
      >
        <Trash2Icon className="text-muted-foreground" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {developerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the write-up and cover image permanently.
            {projectCount > 0
              ? ` ${developerName} is used by ${projectCount} project${projectCount === 1 ? "" : "s"}, so a blank row will be re-created automatically — if you just want it off the public site, use the visibility toggle instead.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              startTransition(async () => {
                try {
                  await deleteDeveloper(developerId)
                  toast.success("Developer deleted")
                  router.refresh()
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to delete developer"
                  )
                }
              })
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
