import Image from "next/image"
import Link from "next/link"
import { Building2Icon, MapPinIcon } from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"

import type { MasterCommunityCard as MasterCommunityCardData } from "@/lib/data/projects"

export function MasterCommunityCard({
  community,
}: {
  community: MasterCommunityCardData
}) {
  return (
    <Link
      href={`/communities/${encodeURIComponent(community.name)}`}
      className="block"
    >
      <Card className="h-full gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {community.coverImageUrl ? (
            <Image
              src={community.coverImageUrl}
              alt={community.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Building2Icon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 p-4">
          <p className="truncate font-semibold">{community.name}</p>
          {community.city && (
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5 shrink-0" />
              {community.city}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {community.projectCount} project
            {community.projectCount === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
