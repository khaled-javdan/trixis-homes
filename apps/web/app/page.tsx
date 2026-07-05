import type { ProjectStatus } from "@workspace/db"

import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ProjectCard } from "@/components/dashboard/project-card"
import { ProjectListItem } from "@/components/dashboard/project-list-item"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { ViewToggle, type DashboardView } from "@/components/dashboard/view-toggle"
import {
  getDashboardStats,
  getFilterOptions,
  getProjectsForDashboard,
} from "@/lib/data/projects"

type SearchParams = Promise<{
  q?: string
  developer?: string
  location?: string
  status?: string
  minPrice?: string
  maxPrice?: string
  view?: string
}>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const filters = {
    q: params.q,
    developer: params.developer,
    location: params.location,
    status: params.status as ProjectStatus | undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  }

  const [projects, stats, filterOptions] = await Promise.all([
    getProjectsForDashboard(filters),
    getDashboardStats(),
    getFilterOptions(),
  ])

  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  )

  const view: DashboardView = params.view === "grid" ? "grid" : "list"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your real estate knowledge base — {stats.totalProjects} project
          {stats.totalProjects === 1 ? "" : "s"} tracked.
        </p>
      </div>
      <StatsBar stats={stats} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <DashboardFilters
            developers={filterOptions.developers}
            locations={filterOptions.locations}
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} />
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
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
