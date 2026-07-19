import { SearchXIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { ActiveFiltersSummary } from "@/components/copilot/active-filters-summary"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { summarizeActiveFilters, toCopilotProjectSummary } from "@/lib/copilot/context"
import {
  parseDashboardFilters,
  type RawSearchParams,
} from "@/lib/data/filters"
import { getProjectsForDashboard } from "@/lib/data/projects"

type SearchParams = Promise<RawSearchParams>

export default async function CopilotPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = parseDashboardFilters(params)
  const projects = await getProjectsForDashboard(filters)
  const chips = summarizeActiveFilters(filters)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Sales Copilot
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Qualify your client and get a ranked recommendation from the
          projects currently in scope.
        </p>
      </div>

      <ActiveFiltersSummary chips={chips} projectCount={projects.length} />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchXIcon className="size-5 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">No projects match your filters</p>
            <p className="text-sm text-muted-foreground">
              Go back to the dashboard and widen your filters to bring
              projects into scope.
            </p>
          </div>
          <ButtonLink href="/projects" className="mt-2" variant="outline">
            Back to Dashboard
          </ButtonLink>
        </div>
      ) : (
        <CopilotChat
          projects={projects.map(toCopilotProjectSummary)}
          filterChips={chips}
        />
      )}
    </div>
  )
}
