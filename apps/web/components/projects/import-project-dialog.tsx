"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { importProject } from "@/lib/actions/projects"

export function ImportProjectDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      startTransition(async () => {
        try {
          const json = JSON.parse(String(reader.result))
          const { id } = await importProject(json)
          toast.success("Project imported")
          setOpen(false)
          router.push(`/projects/${id}`)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to import project"
          )
        }
      })
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UploadIcon /> Import
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
        </DialogHeader>
        <Input
          type="file"
          accept="application/json"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
