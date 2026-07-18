import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import { CtaLink } from "@/components/cta-link"
import { HeroSearch } from "@/components/hero-search"
import { HeroShowcase } from "@/components/hero-showcase"
import { HeroStats } from "@/components/hero-stats"
import { Eyebrow } from "@/components/section-heading"
import { googleRating, site } from "@/lib/content"
import type { HotProject } from "@/lib/projects"

export function Hero({ projects = [] }: { projects?: HotProject[] }) {
  // The photo panel showcases live hot projects; the static marina shot is
  // only the fallback for when none are published with a cover image.
  const showcase = projects.filter((project) => project.coverImageUrl)

  return (
    <section className="hero-surface relative isolate grid min-h-svh text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Mobile is deliberately photo-free: a quiet ink panel with a soft
          copper glow, so the typography and search card lead — the hot
          projects slider right below provides the imagery. */}
      <div className="absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
        <div className="bg-copper/15 absolute -top-24 right-[-30%] size-[28rem] rounded-full blur-[110px]" />
        <div className="bg-copper/10 absolute bottom-[-20%] left-[-25%] size-[24rem] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-center pt-32 pr-6 pb-14 pl-6 sm:pt-36 sm:pr-10 lg:pt-32 lg:pr-10 lg:pl-[calc(max(2.5rem,(100vw-96rem)/2+2.5rem))] xl:pr-12">
        <Eyebrow className="hero-rise">Dubai · Worldwide</Eyebrow>
        <h1 className="hero-rise mt-5 max-w-xl font-heading text-[2.4rem] leading-[1.08] text-balance [animation-delay:90ms] sm:mt-6 sm:text-5xl xl:text-6xl">
          Buy, sell, invest, or rent with confidence.
        </h1>
        <p className="hero-rise mt-5 max-w-lg text-[15px]/7 text-white/70 [animation-delay:180ms] sm:mt-7 sm:text-base/7">
          From luxury homes in Dubai to investments worldwide, Trixis Homes
          delivers seamless, end-to-end property solutions backed by trust and
          expertise.
        </p>
        <div className="hero-rise [animation-delay:270ms]">
          <HeroSearch />
        </div>

        <div className="hero-rise [animation-delay:360ms]">
          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
            <CtaLink
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              Book a Call
            </CtaLink>
            <CtaLink
              href="/projects"
              variant="outline-light"
              className="w-full sm:w-auto"
            >
              Browse all properties
            </CtaLink>
          </div>

          <Link
            href="/#reviews"
            className="mt-6 inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="fill-copper text-copper size-3.5" />
              ))}
            </span>
            <span>
              <span className="font-semibold text-white">
                {googleRating.score}
              </span>{" "}
              · {googleRating.count} Google reviews
            </span>
          </Link>
        </div>

        <div className="hero-rise [animation-delay:450ms]">
          <HeroStats />
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        {showcase.length ? (
          <HeroShowcase projects={showcase} />
        ) : (
          <Image
            src="/images/hero-marina.jpg"
            alt="Dubai Marina at dusk"
            fill
            priority
            sizes="50vw"
            className="animate-kenburns object-cover"
          />
        )}
        <div
          className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black to-transparent"
          aria-hidden
        />
        {/* Keeps the fixed header legible while it floats over the photo. */}
        <div
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  )
}
