import { SparklesIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ProjectCard } from "@/components/dashboard/project-card"
import { ProjectListItem } from "@/components/dashboard/project-list-item"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { ViewToggle, type DashboardView } from "@/components/dashboard/view-toggle"
import {
  hasActiveDashboardFilters,
  parseDashboardFilters,
  type RawSearchParams,
} from "@/lib/data/filters"
import { getFilterOptions, getProjectsForDashboard } from "@/lib/data/projects"

type SearchParams = Promise<RawSearchParams & { view?: string }>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = parseDashboardFilters(params)

  const [projects, filterOptions] = await Promise.all([
    getProjectsForDashboard(filters),
    getFilterOptions(),
  ])

  const stats = {
    totalProjects: projects.length,
    unitsFound: projects.reduce(
      (sum, project) => sum + project.unitTypeCount,
      0
    ),
  }

  const hasFilters = hasActiveDashboardFilters(filters)

  const view: DashboardView = params.view === "grid" ? "grid" : "list"

  const copilotQuery = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value == null || key === "view" ? [] : [[key, String(value)]]
    )
  ).toString()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <DashboardFilters
        developers={filterOptions.developers}
        communities={filterOptions.communities}
        cities={filterOptions.cities}
        paymentPlans={filterOptions.paymentPlans}
        actions={
          <>
            <ButtonLink
              href={copilotQuery ? `/copilot?${copilotQuery}` : "/copilot"}
            >
              <SparklesIcon /> Ask Copilot
            </ButtonLink>
            <ViewToggle view={view} />
          </>
        }
      />
      <StatsBar stats={stats} />

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
