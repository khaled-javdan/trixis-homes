import Image from "next/image"

import { CtaLink } from "@/components/cta-link"
import { SectionHeading } from "@/components/section-heading"
import { developers, site } from "@/lib/content"

function LogoRow({
  row,
  reverse,
}: {
  row: typeof developers
  reverse?: boolean
}) {
  return (
    <div
      className="animate-marquee flex w-max items-center gap-20 [animation-duration:55s]"
      style={reverse ? { animationDirection: "reverse" } : undefined}
    >
      {[...row, ...row].map((developer, i) => (
        <Image
          key={`${developer.name}-${i}`}
          src={developer.logo}
          alt={i < row.length ? `${developer.name} logo` : ""}
          aria-hidden={i >= row.length}
          width={160}
          height={64}
          unoptimized
          className="h-10 w-auto max-w-40 object-contain opacity-55 brightness-0 transition-opacity duration-300 hover:opacity-90"
        />
      ))}
    </div>
  )
}

export function Properties() {
  const mid = Math.ceil(developers.length / 2)
  const rows = [developers.slice(0, mid), developers.slice(mid)]

  return (
    <section
      id="properties"
      className="scroll-mt-20 bg-secondary py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Our Partners"
          title="The top developers we work with."
          lede="Direct access to Dubai's leading developers means first-look inventory, launch pricing, and trusted handovers."
        />
      </div>

      <div className="relative overflow-hidden">
        {/* Soft fade on both edges so rows appear to emerge from shadow. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-secondary to-transparent sm:w-40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-secondary to-transparent sm:w-40"
          aria-hidden
        />
        <div className="flex flex-col gap-14 py-4">
          <LogoRow row={rows[0]!} />
          <LogoRow row={rows[1]!} reverse />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CtaLink href="/developers">View All Developers</CtaLink>
          <CtaLink
            href={site.whatsapp}
            variant="outline-dark"
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to an Advisor
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
