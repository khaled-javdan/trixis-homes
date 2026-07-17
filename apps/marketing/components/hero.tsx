import Image from "next/image"

import { CtaLink } from "@/components/cta-link"
import { HeroSearch } from "@/components/hero-search"
import { Eyebrow } from "@/components/section-heading"
import { site, stats } from "@/lib/content"

export function Hero() {
  return (
    <section className="relative isolate grid min-h-svh bg-ink-deep text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Mobile: the marina photo sits behind the whole panel under a heavy scrim. */}
      <div className="absolute inset-0 lg:hidden" aria-hidden>
        <Image
          src="/images/hero-marina.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink-deep/85" />
      </div>

      <div className="relative z-10 flex flex-col justify-center pb-16 pt-36 pl-6 pr-6 sm:pr-10 lg:pl-[calc(max(2.5rem,(100vw-80rem)/2+2.5rem))] lg:pr-10 lg:pt-32 xl:pr-12">
        <Eyebrow>Dubai · Worldwide</Eyebrow>
        <h1 className="mt-6 max-w-xl font-heading text-[2.6rem] leading-[1.08] text-balance sm:text-5xl xl:text-6xl">
          Buy, sell, invest, or rent with confidence.
        </h1>
        <p className="mt-7 max-w-lg text-base/7 text-white/70">
          From luxury homes in Dubai to investments worldwide, Trixis Homes
          delivers seamless, end-to-end property solutions backed by trust and
          expertise.
        </p>
        <HeroSearch />

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CtaLink href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            Book a Call
          </CtaLink>
          <CtaLink href={site.appUrl} variant="outline-light">
            Browse all properties
          </CtaLink>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/15 pt-10 lg:mt-20 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-heading text-4xl">{stat.value}</dd>
              <dt className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/55">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="/images/hero-marina.jpg"
          alt="Dubai Marina at dusk"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-ink-deep to-transparent"
          aria-hidden
        />
        {/* Keeps the fixed header legible while it floats over the photo. */}
        <div
          className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink-deep/80 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-deep/60 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  )
}
