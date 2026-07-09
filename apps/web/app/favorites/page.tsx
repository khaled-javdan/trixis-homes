import { StarIcon } from "lucide-react"

import { ProjectCard } from "@/components/dashboard/project-card"
import { ProjectListItem } from "@/components/dashboard/project-list-item"
import { ViewToggle, type DashboardView } from "@/components/dashboard/view-toggle"
import { getFavoriteProjects } from "@/lib/data/projects"

type SearchParams = Promise<{ view?: string }>

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const view: DashboardView = params.view === "grid" ? "grid" : "list"

  const projects = await getFavoriteProjects()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Favorite Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"} marked
            as favorite.
          </p>
        </div>
        <ViewToggle view={view} />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <StarIcon className="size-5 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">No favorite projects yet</p>
            <p className="text-sm text-muted-foreground">
              Star a project from the dashboard to see it here.
            </p>
          </div>
        </div>
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
