import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { ProjectCard } from "@/components/projects/project-card"
import { SectionHeading } from "@/components/section-heading"
import { getPublishedProjects } from "@/lib/projects"

/** Home-page section showing the latest published projects. Renders nothing
 * until at least one project is published from the admin app. */
export async function FeaturedProjects() {
  const projects = await getPublishedProjects({}, 10)
  if (!projects.length) return null

  return (
    <section id="projects" className="scroll-mt-20 bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Featured Projects"
          title="Hand-picked launches, straight from the developers."
          lede="Explore the projects our advisors are working on right now — with brochures, floor plans, and launch pricing available on request."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 bg-copper px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
          >
            View All Projects
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
