import { Building2Icon } from "lucide-react"

import { MasterCommunityCard } from "@/components/communities/master-community-card"
import { getMasterCommunities } from "@/lib/data/projects"

export default async function CommunitiesPage() {
  const communities = await getMasterCommunities()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Communities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {communities.length} master compound
          {communities.length === 1 ? "" : "s"} — browse a community to see
          its projects.
        </p>
      </div>

      {communities.length === 0 ? (
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
