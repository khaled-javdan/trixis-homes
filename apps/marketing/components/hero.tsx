import Image from "next/image"

import { CtaLink } from "@/components/cta-link"
import { HeroSearch } from "@/components/hero-search"
import { Eyebrow } from "@/components/section-heading"
import { site, stats } from "@/lib/content"

export function Hero() {
  return (
    <section className="relative isolate grid min-h-svh bg-ink-deep text-white lg:grid-cols-[1.05fr_1fr]">
      {/* Mobile is deliberately photo-free: a quiet ink panel with a soft
          copper glow, so the typography and search card lead — the hot
          projects slider right below provides the imagery. */}
      <div className="absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
        <div className="absolute -top-24 right-[-30%] size-[28rem] rounded-full bg-copper/15 blur-[110px]" />
        <div className="absolute bottom-[-20%] left-[-25%] size-[24rem] rounded-full bg-copper/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-center pb-14 pt-32 pl-6 pr-6 sm:pt-36 sm:pr-10 lg:pl-[calc(max(2.5rem,(100vw-80rem)/2+2.5rem))] lg:pr-10 lg:pt-32 xl:pr-12">
        <Eyebrow>Dubai · Worldwide</Eyebrow>
        <h1 className="mt-5 max-w-xl font-heading text-[2.4rem] leading-[1.08] text-balance sm:mt-6 sm:text-5xl xl:text-6xl">
          Buy, sell, invest, or rent with confidence.
        </h1>
        <p className="mt-5 max-w-lg text-[15px]/7 text-white/70 sm:mt-7 sm:text-base/7">
          From luxury homes in Dubai to investments worldwide, Trixis Homes
          delivers seamless, end-to-end property solutions backed by trust and
          expertise.
        </p>
        <HeroSearch />

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
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

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 sm:mt-16 sm:gap-x-8 sm:gap-y-10 sm:pt-10 lg:mt-20 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-heading text-3xl sm:text-4xl">{stat.value}</dd>
              <dt className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/55 sm:text-[11px]">
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
