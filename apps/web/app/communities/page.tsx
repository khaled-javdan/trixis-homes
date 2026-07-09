import { Building2Icon } from "lucide-react"

import { CommunityCityFilter } from "@/components/communities/community-city-filter"
import { MasterCommunityCard } from "@/components/communities/master-community-card"
import { getMasterCommunities } from "@/lib/data/projects"

type SearchParams = Promise<{ city?: string }>

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const allCommunities = await getMasterCommunities()

  const cityOptions = [
    ...new Set(
      allCommunities
        .map((community) => community.city)
        .filter((city): city is string => Boolean(city))
    ),
  ].sort((a, b) => a.localeCompare(b))

  const communities = params.city
    ? allCommunities.filter((community) => community.city === params.city)
    : allCommunities

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Communities
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {communities.length} master compound
            {communities.length === 1 ? "" : "s"} — browse a community to see
            its projects.
          </p>
        </div>
        {cityOptions.length > 0 && (
          <CommunityCityFilter cities={cityOptions} />
        )}
      </div>

      {allCommunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Building2Icon className="size-5 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">No communities yet</p>
            <p className="text-sm text-muted-foreground">
              Set a Master Community on a project to group it here.
            </p>
          </div>
        </div>
      ) : communities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Building2Icon className="size-5 text-muted-foreground" />
          </span>
          <div>
            <p className="font-medium">No communities in {params.city}</p>
            <p className="text-sm text-muted-foreground">
              Try a different city.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <MasterCommunityCard key={community.name} community={community} />
          ))}
        </div>
      )}
    </div>
  )
}
