import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { EmptyState } from "@/components/dashboard/empty-state"
import { GroupToggle } from "@/components/dashboard/group-toggle"
import { ProjectCard } from "@/components/dashboard/project-card"
import { ProjectListItem } from "@/components/dashboard/project-list-item"
import { SortableProjectList } from "@/components/dashboard/sortable-project-list"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { ViewToggle, type DashboardView } from "@/components/dashboard/view-toggle"
import {
  hasActiveDashboardFilters,
  parseDashboardFilters,
  type RawSearchParams,
} from "@/lib/data/filters"
import {
  getFilterOptions,
  getProjectsForDashboard,
  groupProjectsByMasterCommunity,
  type ProjectCard as ProjectCardData,
} from "@/lib/data/projects"

type SearchParams = Promise<
  RawSearchParams & { view?: string; group?: string }
>

function ProjectsView({
  projects,
  view,
  sortable,
}: {
  projects: ProjectCardData[]
  view: DashboardView
  // Owner drag-to-reorder (list view only). Enabled on the unfiltered list.
  sortable?: boolean
}) {
  return view === "list" ? (
    sortable ? (
      <SortableProjectList projects={projects} />
    ) : (
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </div>
    )
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

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
  // Grouped by community is the default; the toggle sets `group=none` to opt out.
  const grouped = params.group !== "none"
  const groups = grouped ? groupProjectsByMasterCommunity(projects) : null

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
            <GroupToggle grouped={grouped} />
            <ViewToggle view={view} />
          </>
        }
      />
      <StatsBar stats={stats} />

      {projects.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : groups ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div
              key={group.masterCommunity ?? "__ungrouped"}
              className="flex flex-col gap-3"
            >
              <div className="flex items-baseline gap-2">
                {group.masterCommunity ? (
                  <Link
                    href={`/communities/${encodeURIComponent(group.masterCommunity)}`}
                    className="text-lg font-semibold tracking-tight hover:underline"
                  >
                    {group.masterCommunity}
                  </Link>
                ) : (
                  <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">
                    Other Projects
                  </h2>
                )}
                <span className="text-sm text-muted-foreground">
                  {group.projects.length}
                </span>
              </div>
              <ProjectsView
                projects={group.projects}
                view={view}
                sortable={!hasFilters}
              />
            </div>
          ))}
        </div>
      ) : (
        <ProjectsView projects={projects} view={view} sortable={!hasFilters} />
      )}
    </div>
  )
}
