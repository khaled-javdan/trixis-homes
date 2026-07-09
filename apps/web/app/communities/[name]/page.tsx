import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { ProjectCard } from "@/components/dashboard/project-card"
import { getProjectsByMasterCommunity } from "@/lib/data/projects"

export default async function MasterCommunityPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const masterCommunity = decodeURIComponent(name)
  const projects = await getProjectsByMasterCommunity(masterCommunity)

  if (projects.length === 0) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/communities"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" /> Communities
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {masterCommunity}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {projects.length} project{projects.length === 1 ? "" : "s"} in this
          community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
