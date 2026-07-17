import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BedDouble, MapPin } from "lucide-react"

import {
  formatBedroomsList,
  formatPriceShort,
  formatProjectStatus,
} from "@/lib/format"
import type { PublicProjectCard } from "@/lib/projects"

export function ProjectCard({ project }: { project: PublicProjectCard }) {
  const bedrooms = formatBedroomsList(project.bedrooms)

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-ink/10 bg-white transition-shadow hover:shadow-xl hover:shadow-ink/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-2xl text-ink/25">
            {project.name}
          </div>
        )}
        <span className="absolute left-4 top-4 bg-ink/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {formatProjectStatus(project.status)}
        </span>
        {project.completionYear ? (
          <span className="absolute right-4 top-4 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
            {project.completionYear}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-copper">
            Starting from {formatPriceShort(project.startingPrice) ?? "Price on request"}
          </p>
          <h3 className="mt-2 font-heading text-2xl text-ink">{project.name}</h3>
          <p className="mt-1 text-sm text-ink/55">by {project.developer}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/60">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-copper" aria-hidden />
            {project.area}
          </span>
          {bedrooms ? (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-copper" aria-hidden />
              {bedrooms}
            </span>
          ) : null}
        </div>

        <span className="flex items-center gap-2 border-t border-ink/10 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors group-hover:text-copper">
          View Project
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )
}
