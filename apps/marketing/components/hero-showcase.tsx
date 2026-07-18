"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { formatPriceShort, formatProjectStatus } from "@/lib/format"
import type { HotProject } from "@/lib/projects"

const ROTATE_MS = 7000

/** Crossfading rotation of hot-project covers in the hero's photo panel,
 * with a glass chip linking to the active project. Every project passed in
 * must have a coverImageUrl (the hero filters before rendering). */
export function HeroShowcase({ projects }: { projects: HotProject[] }) {
  const [index, setIndex] = useState(0)
  const count = projects.length

  useEffect(() => {
    if (count <= 1) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      ROTATE_MS
    )
    return () => clearInterval(timer)
  }, [count])

  const active = projects[index]!
  const price = formatPriceShort(active.startingPrice)

  return (
    <>
      {projects.map((project, slideIndex) => (
        <div
          key={project.id}
          aria-hidden={slideIndex !== index}
          className={cn(
            "absolute inset-0 overflow-hidden transition-opacity duration-1000",
            slideIndex === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={project.coverImageUrl!}
            alt={project.name}
            fill
            priority={slideIndex === 0}
            sizes="50vw"
            className="animate-kenburns object-cover"
          />
        </div>
      ))}

      {/* The hero column can be taller than the viewport, which pushes the
          panel's bottom edge below the fold — so the chip anchors to the
          first viewport height (the section starts at scroll 0) instead of
          the panel bottom. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh">
        {/* Keyed on the project so the fade replays on each rotation. */}
        <Link
          key={active.id}
          href={`/projects/${active.slug}`}
          className="animate-hero-fade group pointer-events-auto absolute right-10 bottom-10 block w-full max-w-sm"
        >
          <div className="bg-ink-deep/45 group-hover:bg-ink-deep/60 rounded-2xl border border-white/15 p-5 backdrop-blur-md transition-colors group-hover:border-white/30">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-copper text-[10px] font-semibold tracking-[0.22em] uppercase">
                  Hot Right Now · {formatProjectStatus(active.status)}
                </p>
                <p className="mt-2 truncate font-heading text-xl text-white">
                  {active.name}
                </p>
                <p className="mt-1 truncate text-sm text-white/70">
                  {active.area}
                  {price ? ` · From ${price}` : ""}
                </p>
              </div>
              <span className="group-hover:border-copper group-hover:bg-copper mt-0.5 shrink-0 rounded-full border border-white/20 p-2 text-white/80 transition-all group-hover:text-white">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>
            {count > 1 ? (
              <div className="mt-4 flex gap-1.5" aria-hidden>
                {projects.map((project, barIndex) => (
                  <span
                    key={project.id}
                    className="block h-0.5 w-6 overflow-hidden rounded-full bg-white/25"
                  >
                    {barIndex === index ? (
                      <span
                        className="animate-hero-progress bg-copper block h-full w-full rounded-full"
                        style={{ animationDuration: `${ROTATE_MS}ms` }}
                      />
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Link>
      </div>
    </>
  )
}
