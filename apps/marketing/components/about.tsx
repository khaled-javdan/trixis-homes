import Image from "next/image"

import { CtaLink } from "@/components/cta-link"
import { Eyebrow } from "@/components/section-heading"
import { mission, site, stats } from "@/lib/content"

export function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>Who We Are</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl leading-[1.12] text-balance sm:text-4xl lg:text-[2.75rem]">
              Dubai real estate, guided by people who take it personally.
            </h2>
            <p className="mt-6 max-w-xl text-base/7 text-muted-foreground">
              Trixis Homes was built on a simple belief: buying or renting
              property should feel clear, honest, and genuinely in your corner.
              Whether you&rsquo;re an investor chasing returns, a family
              searching for a place to call home, or a landlord protecting an
              asset, we bring deep local market knowledge to every decision.
            </p>
            <p className="mt-4 max-w-xl text-base/7 text-muted-foreground">
              From the first conversation to the final handover, you get
              straight advice, full transparency, and a team that measures its
              success by yours — not the size of the deal.
            </p>
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-t border-foreground/15 pt-6"
                >
                  <dd className="font-heading text-4xl text-copper">
                    {stat.value}
                  </dd>
                  <dt className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/team/us.jpg"
                alt="The Trixis Homes team"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-28 grid gap-4 md:grid-cols-2">
          <div className="bg-secondary p-10 lg:p-14">
            <Eyebrow>Our Vision</Eyebrow>
            <p className="mt-6 font-heading text-2xl leading-snug text-balance">
              To redefine real estate by building the world&rsquo;s most trusted
              brokerage — beginning in Dubai and reaching every corner of the
              globe.
            </p>
          </div>
          <div className="bg-secondary p-10 lg:p-14">
            <Eyebrow>Our Mission</Eyebrow>
            <ul className="mt-6 flex flex-col gap-3.5">
              {mission.map((item) => (
                <li key={item} className="flex gap-3 text-sm/6 text-muted-foreground">
                  <span className="mt-1.5 text-[8px] text-copper" aria-hidden>
                    ◆
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CtaLink href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            Book a Call
          </CtaLink>
          <CtaLink href="/#team" variant="outline-dark">
            Meet the Team
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
