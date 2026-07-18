"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { Eyebrow } from "@/components/section-heading"
import {
  formatPaymentPlanShort,
  formatPriceShort,
  formatProjectStatus,
} from "@/lib/format"
import type { HotProject } from "@/lib/projects"

const AUTOPLAY_MS = 6000

function SlideStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.22em] text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl text-white sm:text-2xl">
        {value}
      </p>
    </div>
  )
}

export function HotProjectsSlider({ projects }: { projects: HotProject[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = projects.length

  // `index` is a dependency so manual navigation restarts the full interval,
  // keeping the dots' progress fill honest about when the next switch is.
  useEffect(() => {
    if (count <= 1 || paused) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      AUTOPLAY_MS
    )
    return () => clearInterval(timer)
  }, [count, paused, index])

  if (!count) return null

  return (
    // On lg+ the hero's showcase panel already rotates through the same hot
    // projects, so this full-screen slider only renders below it — where the
    // hero is deliberately photo-free.
    <section
      aria-label="Hot projects"
      className="bg-ink-deep relative h-svh overflow-hidden text-white lg:hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {projects.map((project, slideIndex) => (
          <div
            key={project.id}
            className="relative h-full w-full shrink-0"
            aria-hidden={slideIndex !== index}
          >
            {project.coverImageUrl ? (
              <Image
                src={project.coverImageUrl}
                alt={project.name}
                fill
                priority={slideIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            {/* Soft overall scrim keeps the photo readable… */}
            <div
              className="from-ink-deep/60 via-ink-deep/25 to-ink-deep/20 absolute inset-0 bg-gradient-to-t"
              aria-hidden
            />
            {/* …while a taller, darker band anchors the text block itself. */}
            <div
              className="from-ink-deep via-ink-deep/80 absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t to-transparent"
              aria-hidden
            />
            <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 lg:px-10">
              <Eyebrow className="text-copper">
                Hot Right Now · {formatProjectStatus(project.status)}
              </Eyebrow>
              <h2 className="mt-4 max-w-3xl font-heading text-4xl leading-[1.08] text-balance sm:text-6xl">
                {project.name}
              </h2>
              <p className="mt-3 text-lg text-white/75">
                by {project.developer} ·{" "}
                {[project.area, project.city].filter(Boolean).join(", ")}
              </p>
              <div className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
                {formatPriceShort(project.startingPrice) ? (
                  <SlideStat
                    label="Starting Price"
                    value={formatPriceShort(project.startingPrice)!}
                  />
                ) : null}
                {formatPaymentPlanShort(project.paymentPlan) ? (
                  <SlideStat
                    label="Payment Plan"
                    value={formatPaymentPlanShort(project.paymentPlan)!}
                  />
                ) : null}
                {project.completionYear != null ? (
                  <SlideStat
                    label="Handover"
                    value={String(project.completionYear)}
                  />
                ) : null}
              </div>
              <div className="mt-10">
                <Link
                  href={`/projects/${project.slug}`}
                  className="bg-copper hover:bg-copper-deep inline-flex items-center gap-2 px-7 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-white uppercase transition-colors"
                >
                  View Project
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => setIndex((index - 1 + count) % count)}
            className="absolute top-1/2 left-4 hidden -translate-y-1/2 border border-white/30 p-3 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white sm:block lg:left-8"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => setIndex((index + 1) % count)}
            className="absolute top-1/2 right-4 hidden -translate-y-1/2 border border-white/30 p-3 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white sm:block lg:right-8"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2.5">
            {projects.map((project, dotIndex) => (
              <button
                key={project.id}
                type="button"
                aria-label={`Go to ${project.name}`}
                aria-current={dotIndex === index}
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-1 w-8 overflow-hidden transition-colors",
                  dotIndex === index
                    ? "bg-white/30"
                    : "bg-white/30 hover:bg-white/60"
                )}
              >
                {dotIndex === index ? (
                  // Keyed on `paused` too: the autoplay effect restarts its
                  // full interval on unpause, so the fill restarts with it.
                  <span
                    key={`${project.id}-${paused}`}
                    className="animate-hero-progress bg-copper block h-full w-full"
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                    aria-hidden
                  />
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
