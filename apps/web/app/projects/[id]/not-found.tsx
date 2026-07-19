import { ButtonLink } from "@/components/button-link"

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-lg font-medium">Project not found</p>
      <p className="text-sm text-muted-foreground">
        It may have been deleted or the link is incorrect.
      </p>
      <ButtonLink href="/projects" className="mt-2">
        Back to Dashboard
      </ButtonLink>
    </div>
  )
}
