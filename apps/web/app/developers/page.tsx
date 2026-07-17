import Image from "next/image"
import { redirect } from "next/navigation"
import { ImageOffIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"

import {
  DeleteDeveloperButton,
  DeveloperVisibilitySwitch,
} from "@/components/developers/developer-card-controls"
import { DeveloperEditDialog } from "@/components/developers/developer-edit-dialog"
import { syncDevelopersFromProjects } from "@/lib/actions/developers"
import { isAdmin } from "@/lib/auth"
import { getDevelopersForAdmin } from "@/lib/data/developers"

export default async function DevelopersAdminPage() {
  if (!(await isAdmin())) {
    redirect("/login?next=/developers")
  }

  // Pick up any project developers that don't have a config row yet.
  await syncDevelopersFromProjects()
  const developers = await getDevelopersForAdmin()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Developers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editorial content for the public developers page — cover image and
          write-up per developer. Rows are created automatically for any
          developer that appears on a project.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {developers.map((developer) => (
          <div
            key={developer.id}
            className={`flex flex-col overflow-hidden rounded-lg border border-border bg-card ${developer.isVisible ? "" : "opacity-70"}`}
          >
            <div className="relative aspect-[16/9] bg-muted">
              {developer.coverImageUrl ? (
                <Image
                  src={developer.coverImageUrl}
                  alt={`${developer.name} cover`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground/60">
                  <ImageOffIcon className="size-5" />
                  <span className="text-xs">No cover image</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium">{developer.name}</h2>
                <Badge variant="secondary">
                  {developer.projectCount}{" "}
                  {developer.projectCount === 1 ? "project" : "projects"}
                </Badge>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {developer.description ?? "No description yet."}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <DeveloperEditDialog developer={developer} />
                  <DeleteDeveloperButton
                    developerId={developer.id}
                    developerName={developer.name}
                    projectCount={developer.projectCount}
                  />
                </div>
                <DeveloperVisibilitySwitch
                  developerId={developer.id}
                  isVisible={developer.isVisible}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
