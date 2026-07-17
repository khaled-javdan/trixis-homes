"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { useIsAdmin } from "@/components/admin-provider"
import { duplicateProject } from "@/lib/actions/projects"

export function DuplicateProjectButton({ projectId }: { projectId: string }) {
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
