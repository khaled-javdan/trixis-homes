import type { Metadata } from "next"
import Link from "next/link"

import type { PropertyType } from "@workspace/db"

import { ProjectCard } from "@/components/projects/project-card"
import { Eyebrow } from "@/components/section-heading"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { site } from "@/lib/content"
import { formatPriceShort, formatPropertyType } from "@/lib/format"
import { getPublishedProjects, type PublicProjectFilters } from "@/lib/projects"

export const metadata: Metadata = {
  title: "Off-Plan Projects in Dubai — Trixis Homes",
  description:
    "Hand-picked off-plan and ready projects from Dubai's leading developers. Explore starting prices, payment plans, and handover dates — and request brochures and floor plans.",
}

// Project publishing happens in the admin app, so this page must always read
// fresh data.
export const dynamic = "force-dynamic"

const propertyTypeValues: PropertyType[] = [
  "APARTMENT",
  "TOWNHOUSE",
  "VILLA",
  "PENTHOUSE",
  "DUPLEX",
  "OFFICE",
  "RETAIL",
  "OTHER",
]

type SearchParams = {
  developer?: string
  community?: string
  propertyType?: string
  bedrooms?: string
  maxPrice?: string
}

// Parses the URL filter contract (developer | community | propertyType |
// bedrooms | maxPrice) into typed filters, ignoring anything malformed.
function parseFilters(params: SearchParams): PublicProjectFilters {
  const filters: PublicProjectFilters = {}
  if (params.developer?.trim()) filters.developer = params.developer.trim()
  if (params.community?.trim()) filters.community = params.community.trim()
  if (
    params.propertyType &&
    (propertyTypeValues as string[]).includes(params.propertyType)
  ) {
    filters.propertyType = params.propertyType as PropertyType
  }
  if (params.bedrooms) {
    const counts = params.bedrooms
      .split("|")
      .map(Number)
      .filter((count) => Number.isInteger(count) && count >= 0 && count <= 20)
    if (counts.length) filters.bedrooms = counts
  }
  if (params.maxPrice) {
    const maxPrice = Number(params.maxPrice)
    if (Number.isFinite(maxPrice) && maxPrice > 0) filters.maxPrice = maxPrice
  }
  return filters
}

function filterSummary(filters: PublicProjectFilters): string[] {
  const parts: string[] = []
  if (filters.developer) parts.push(`by ${filters.developer}`)
  if (filters.community) parts.push(filters.community)
  if (filters.propertyType)
    parts.push(`${formatPropertyType(filters.propertyType)}s`)
  if (filters.bedrooms?.length) {
    const min = Math.min(...filters.bedrooms)
    if (filters.bedrooms.some((count) => count >= 5)) {
      parts.push(`${min}+ bedrooms`)
    } else if (filters.bedrooms.length === 1 && filters.bedrooms[0] === 0) {
      parts.push("Studios")
    } else {
      const labels = filters.bedrooms
        .map((count) => (count === 0 ? "Studio" : count))
        .join(", ")
      parts.push(
        `${labels} bedroom${filters.bedrooms.length === 1 && filters.bedrooms[0] === 1 ? "" : "s"}`
      )
    }
  }
  if (filters.maxPrice != null)
    parts.push(`up to ${formatPriceShort(filters.maxPrice)}`)
  return parts
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = parseFilters(await searchParams)
  const filtering = Object.keys(filters).length > 0
  const projects = await getPublishedProjects(filters)
  const summary = filterSummary(filters)

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="pt-20">
        <section className="bg-ink-deep py-20 text-white lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Eyebrow className="text-copper">
              {filtering ? "Your Search" : "Curated Portfolio"}
            </Eyebrow>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.1] text-balance sm:text-5xl">
              {filtering
                ? `${projects.length} ${projects.length === 1 ? "project matches" : "projects match"} your search.`
                : "Projects we work on, straight from the developers."}
            </h1>
            <p className="mt-6 max-w-xl text-sm/6 text-white/65">
              {filtering && summary.length
                ? `Showing results for ${summary.join(" · ")}.`
                : "A hand-picked selection of Dubai launches our advisors know inside out. Register your interest on any project to receive brochures, floor plans, and the latest availability."}
            </p>
            {filtering ? (
              <Link
                href="/projects"
                className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper transition-colors hover:text-white"
              >
                Clear filters ×
              </Link>
            ) : null}
          </div>
        </section>

        <section className="bg-ivory py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {projects.length ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="font-heading text-2xl text-ink">
                  {filtering
                    ? "No projects match your search — yet."
                    : "New projects are on the way."}
                </p>
                <p className="mx-auto mt-4 max-w-md text-sm/6 text-ink/60">
                  {filtering
                    ? "Try widening your search, or tell our advisors what you're looking for — they often have access to inventory before it's listed."
                    : "We're curating our next selection of launches. In the meantime, our advisors can walk you through everything currently available."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {filtering ? (
                    <Link
                      href="/projects"
                      className="inline-flex border border-ink/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-copper hover:text-copper"
                    >
                      View All Projects
                    </Link>
                  ) : null}
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex bg-copper px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
                  >
                    Talk to an Advisor
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
