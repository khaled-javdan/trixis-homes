"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ProjectForm } from "@/components/projects/project-form"
import { createProject } from "@/lib/actions/projects"

export default function NewProjectPage() {
  const router = useRouter()

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectForm
          submitLabel="Create Project"
          onSubmit={async (input) => {
            const { id } = await createProject(input)
            toast.success("Project created")
            router.push(`/projects/${id}`)
          }}
        />
      </CardContent>
    </Card>
  )
}
