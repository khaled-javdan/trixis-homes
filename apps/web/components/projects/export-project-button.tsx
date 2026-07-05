"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { exportProject } from "@/lib/actions/projects"

export function ExportProjectButton({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const data = await exportProject(projectId)
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = `${projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`
            anchor.click()
            URL.revokeObjectURL(url)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to export project"
            )
          }
        })
      }}
    >
      <DownloadIcon /> Export
    </Button>
  )
}
