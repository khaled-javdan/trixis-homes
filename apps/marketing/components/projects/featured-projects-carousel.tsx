"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { ProjectCard } from "@/components/projects/project-card"
import type { PublicProjectCard } from "@/lib/projects"

/**
 * Renders the featured projects as a native scroll-snap carousel on mobile
 * (with dot indicators) and a static grid from `sm` up. The dots track the
 * scroll position and let the visitor jump between cards.
 */
export function FeaturedProjectsCarousel({
  projects,
}: {
  projects: PublicProjectCard[]
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function stride() {
    const el = scrollerRef.current
    return el ? el.scrollWidth / projects.length : 0
  }

  function handleScroll() {
    const el = scrollerRef.current
    if (!el) return
    const width = stride()
    if (!width) return
    const index = Math.round(el.scrollLeft / width)
    setActive(Math.min(projects.length - 1, Math.max(0, index)))
  }

  function goTo(index: number) {
    const clamped = Math.min(projects.length - 1, Math.max(0, index))
    scrollerRef.current?.scrollTo({
      left: clamped * stride(),
      behavior: "smooth",
    })
  }

  const multiple = projects.length > 1

  return (
    <>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="w-[85%] shrink-0 snap-center sm:w-auto sm:shrink"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* Mobile-only prev/next controls — larger tap targets than the dots.
            Positioned over the card image (aspect-4/3 at the top of the card). */}
        {multiple ? (
          <>
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              className="absolute left-2 top-[30%] flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-opacity active:bg-ink/75 disabled:pointer-events-none disabled:opacity-0 sm:hidden"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => goTo(active + 1)}
              disabled={active === projects.length - 1}
              className="absolute right-2 top-[30%] flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-opacity active:bg-ink/75 disabled:pointer-events-none disabled:opacity-0 sm:hidden"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {multiple ? (
        <div className="mt-6 flex justify-center gap-2 sm:hidden">
          {projects.map((project, i) => (
            <button
              key={project.id}
              type="button"
              aria-label={`Go to project ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === active ? "w-6 bg-copper" : "w-2 bg-ink/20 hover:bg-ink/40"
              )}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
