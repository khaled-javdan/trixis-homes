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
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl text-white sm:text-2xl">{value}</p>
    </div>
  )
}

export function HotProjectsSlider({ projects }: { projects: HotProject[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = projects.length

  useEffect(() => {
    if (count <= 1 || paused) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % count),
      AUTOPLAY_MS
    )
    return () => clearInterval(timer)
  }, [count, paused])

  if (!count) return null

  return (
    <section
      aria-label="Hot projects"
      className="relative h-svh overflow-hidden bg-ink-deep text-white"
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
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink-deep/95 via-ink-deep/40 to-ink-deep/25"
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
                  className="inline-flex items-center gap-2 bg-copper px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
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
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 border border-white/30 p-3 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white sm:block lg:left-8"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => setIndex((index + 1) % count)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 border border-white/30 p-3 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white sm:block lg:right-8"
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
                  "h-1 w-8 transition-colors",
                  dotIndex === index ? "bg-copper" : "bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
