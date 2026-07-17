"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

import {
  ProjectForm,
  type ProjectFormDefaults,
} from "@/components/projects/project-form"
import { useIsAdmin } from "@/components/admin-provider"
import { updateProject } from "@/lib/actions/projects"

export function EditProjectDialog({
  projectId,
  defaultValues,
}: {
  projectId: string
  defaultValues: ProjectFormDefaults
}) {
  const isAdmin = useIsAdmin()
  const [open, setOpen] = React.useState(false)

  if (!isAdmin) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon /> Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <ProjectForm
          defaultValues={defaultValues}
          submitLabel="Save Changes"
          onSubmit={async (input) => {
            await updateProject(projectId, input)
            toast.success("Project updated")
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
