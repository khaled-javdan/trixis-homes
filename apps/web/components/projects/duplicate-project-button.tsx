"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { duplicateProject } from "@/lib/actions/projects"

export function DuplicateProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const { id } = await duplicateProject(projectId)
            toast.success("Project duplicated")
            router.push(`/projects/${id}`)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to duplicate project"
            )
          }
        })
      }}
    >
      <CopyIcon /> Duplicate
    </Button>
  )
}
