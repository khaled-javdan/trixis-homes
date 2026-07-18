import {
  Briefcase,
  Building2,
  Gem,
  Globe,
  Handshake,
  KeyRound,
} from "lucide-react"

import { CtaLink } from "@/components/cta-link"
import { SectionHeading } from "@/components/section-heading"
import { services, site } from "@/lib/content"

const icons = [Handshake, Building2, Globe, Briefcase, Gem, KeyRound]

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="What We Offer"
          title="Every property need, one trusted partner."
          lede="Our services span luxury sales, off-plan investments, and premium rentals — in Dubai and far beyond."
        />
        <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = icons[i]!
            return (
              <article
                key={service.title}
                className="group border-t border-foreground/15 pt-8 transition-colors duration-300 hover:border-copper"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.2em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon
                    className="size-5 text-copper"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <h3 className="mt-6 font-heading text-2xl">{service.title}</h3>
                <p className="mt-3 text-sm/6 text-muted-foreground">
                  {service.description}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CtaLink href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            Discuss Your Requirements
          </CtaLink>
          <CtaLink href="/projects" variant="outline-dark">
            Browse Projects
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
