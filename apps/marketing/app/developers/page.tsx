import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Building2, TrendingUp } from "lucide-react"

import { Eyebrow, SectionHeading } from "@/components/section-heading"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { developers, site } from "@/lib/content"
import {
  getPublicDevelopers,
  getPublishedDeveloperStats,
  type PublicDeveloper,
  type PublishedDeveloperStat,
} from "@/lib/projects"

export const metadata: Metadata = {
  title: "Dubai Real Estate Developers — Trixis Homes",
  description:
    "The UAE's leading real estate developers — Emaar, Aldar, Sobha, Nakheel, DAMAC and more. Browse each developer's off-plan projects and register your interest with Trixis Homes.",
}

// Project counts come from the database (projects are published from the
// admin app), so this page always reads fresh.
export const dynamic = "force-dynamic"

type DeveloperCard = {
  name: string
  logo: string | null
  description: string
  projectCount: number
  coverImageUrl: string | null
}

function loose(a: string, b: string): boolean {
  const left = a.toLowerCase()
  const right = b.toLowerCase()
  return left.includes(right) || right.includes(left)
}

function fallbackDescription(name: string): string {
  return `${name} is one of the developers our advisors work with directly — ask us about their current launches, payment plans, and availability.`
}

// Cards come from the Developer table (write-up + cover image are configured
// in the admin app), enriched with live stats from published projects and
// the curated brand logo list. Loose name matching pairs "Aldar" with the
// DB's "Aldar Properties"; a published developer with no config row yet
// still gets a card.
function buildCards(
  rows: PublicDeveloper[],
  stats: PublishedDeveloperStat[]
): DeveloperCard[] {
  const remaining = [...stats]
  const takeStat = (name: string) => {
    const index = remaining.findIndex((stat) => loose(stat.developer, name))
    return index === -1 ? null : remaining.splice(index, 1)[0]!
  }
  const staticLogoFor = (name: string) =>
    developers.find((developer) => loose(developer.name, name))?.logo ?? null

  // Every row consumes its matching stat — including hidden rows, so a
  // hidden developer's projects don't resurface as a fallback card below.
  // `||` (not `??`): legacy rows may hold empty strings, which should fall
  // through to the static logo / project cover just like null.
  const cards: DeveloperCard[] = rows.flatMap((row) => {
    const stat = takeStat(row.name)
    if (!row.isVisible) return []
    return [
      {
        name: row.name,
        logo: row.logoUrl || staticLogoFor(row.name),
        description: row.description || fallbackDescription(row.name),
        projectCount: stat?.projectCount ?? 0,
        coverImageUrl: row.coverImageUrl || stat?.coverImageUrl || null,
      },
    ]
  })

  for (const stat of remaining) {
    cards.push({
      name: stat.developer,
      logo: staticLogoFor(stat.developer),
      description: fallbackDescription(stat.developer),
      projectCount: stat.projectCount,
      coverImageUrl: stat.coverImageUrl,
    })
  }

  // Developers with live projects lead the grid; alphabetical within a tier.
  return cards.sort(
    (a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name)
  )
}

const faqs = [
  {
    question: "Why does the developer matter when buying off-plan?",
    answer:
      "With off-plan you're buying a promise, so the developer's track record is your main protection: delivery history, build quality, and how earlier communities have held their value all shape your outcome.",
  },
  {
    question: "Can foreign nationals buy from these developers?",
    answer:
      "Yes. All the developers listed here sell freehold property in designated freehold areas, where foreign buyers get 100% ownership with no residency requirement.",
  },
  {
    question: "How do payment plans differ between developers?",
    answer:
      "Each developer sets its own structure — some ask 10–20% down with the balance staged to handover, others offer post-handover instalments or monthly plans. Our advisors compare the options for your budget.",
  },
  {
    question: "Does Trixis Homes charge a fee for developer bookings?",
    answer:
      "No. We book directly with the developer at official prices and are compensated by them — you pay only the standard purchase costs, such as the 4% DLD registration fee.",
  },
  {
    question: "Can a property from these developers qualify me for a Golden Visa?",
    answer:
      "Typically yes — property investments of AED 2 million or more make the owner eligible to apply for a 10-year renewable UAE Golden Visa, subject to prevailing regulations.",
  },
]

const whyPoints = [
  "Direct access to official launch pricing and first-look inventory",
  "Compare project styles, communities, and price segments side by side",
  "Track records you can verify — delivery history and community quality",
  "Exclusive early access to new launches before public release",
]

function DeveloperCardView({ card }: { card: DeveloperCard }) {
  const hasProjects = card.projectCount > 0
  const paragraphs = card.description.split(/\n{2,}/)

  return (
    <article className="group flex flex-col border border-ink/10 bg-white">
      <div className="relative aspect-[16/9] overflow-hidden bg-ivory">
        {card.coverImageUrl ? (
          <Image
            src={card.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {!card.coverImageUrl ? (
          <span className="absolute inset-0 flex items-center justify-center font-heading text-3xl text-ink/15">
            {card.name}
          </span>
        ) : null}
        {card.logo ? (
          <span className="absolute right-4 top-4 flex h-14 w-28 items-center justify-center bg-white/95 p-2.5 shadow-sm">
            <Image
              src={card.logo}
              alt={`${card.name} logo`}
              width={160}
              height={64}
              unoptimized
              className="max-h-full w-auto max-w-full object-contain opacity-80 brightness-0"
            />
          </span>
        ) : null}
        {hasProjects ? (
          <span className="absolute left-4 top-4 bg-ink/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            {card.projectCount}{" "}
            {card.projectCount === 1 ? "project" : "projects"} available
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h2 className="font-heading text-2xl text-ink">{card.name}</h2>
          <p className="mt-3 text-sm/6 text-ink/65">{paragraphs[0]}</p>
          {paragraphs.length > 1 ? (
            <details className="group/more mt-2">
              <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.18em] text-copper transition-colors hover:text-copper-deep group-open/more:hidden [&::-webkit-details-marker]:hidden">
                Read more
              </summary>
              {paragraphs.slice(1).map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm/6 text-ink/65">
                  {paragraph}
                </p>
              ))}
            </details>
          ) : null}
        </div>
        <div className="mt-auto border-t border-ink/10 pt-4">
          {hasProjects ? (
            <Link
              href={`/projects?developer=${encodeURIComponent(card.name)}`}
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:text-copper"
            >
              View Projects
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          ) : (
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-copper"
            >
              Ask About {card.name}
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default async function DevelopersPage() {
  const [rows, stats] = await Promise.all([
    getPublicDevelopers(),
    getPublishedDeveloperStats(),
  ])
  const cards = buildCards(rows, stats)

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="pt-20">
        <section className="bg-ink-deep py-20 text-white lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Eyebrow className="text-copper">Our Partners</Eyebrow>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.1] text-balance sm:text-5xl">
              The UAE&apos;s leading real estate developers.
            </h1>
            <p className="mt-6 max-w-xl text-sm/6 text-white/65">
              We book directly with the region&apos;s most trusted developers —
              from master planners like Emaar, Aldar, and Nakheel to design-led
              boutique builders. Browse by developer to compare communities,
              payment plans, and launches.
            </p>
          </div>
        </section>

        <section className="bg-ivory py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <DeveloperCardView key={card.name} card={card} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-10">
            <div>
              <Eyebrow>Why Browse by Developer</Eyebrow>
              <h2 className="mt-5 font-heading text-3xl leading-[1.15] text-ink sm:text-4xl">
                The developer is half the investment decision.
              </h2>
              <p className="mt-6 max-w-md text-sm/6 text-ink/65">
                Two projects at the same price can perform very differently by
                handover. Delivery record, build quality, and community
                management drive both rental demand and resale value — so we
                start every search with the developer, not just the floor plan.
              </p>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-copper px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
              >
                Talk to an Advisor
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
            <ul className="flex flex-col gap-5 lg:pt-2">
              {whyPoints.map((point, index) => (
                <li key={point} className="flex gap-4">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-copper/10 text-copper"
                    aria-hidden
                  >
                    {index === 0 ? (
                      <BadgeCheck className="size-4" />
                    ) : index === 1 ? (
                      <Building2 className="size-4" />
                    ) : (
                      <TrendingUp className="size-4" />
                    )}
                  </span>
                  <p className="text-[15px]/7 text-ink/75">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-ivory py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionHeading
              eyebrow="Common Questions"
              title="Buying from Dubai's developers."
              lede="Everything you need to know about buying off-plan directly from a developer, with Trixis Homes advising at every step."
            />
            <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 bg-white">
              {faqs.map((faq) => (
                <details key={faq.question} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-heading text-lg text-ink transition-colors hover:text-copper [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      className="text-copper transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm/6 text-ink/70">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
