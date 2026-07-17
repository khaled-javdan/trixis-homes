import Image from "next/image"
import { Mail, Phone } from "lucide-react"

import { CtaLink } from "@/components/cta-link"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { site } from "@/lib/content"

export function Cta() {
  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden">
      <Image
        src="/images/cta-villa.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-ink-deep/85" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-6 py-28 text-center text-white lg:py-40">
        <h2 className="font-heading text-4xl leading-[1.1] text-balance lg:text-5xl">
          Let&rsquo;s make your property journey effortless.
        </h2>
        <p className="mt-6 text-base/7 text-white/70">
          Whether you&rsquo;re looking to buy, rent, or invest, our team is here
          to guide you every step of the way. Let&rsquo;s turn your property
          goals into reality.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CtaLink href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            Book a Call
          </CtaLink>
          <CtaLink
            href={site.whatsapp}
            variant="outline-light"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp Us
          </CtaLink>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-white/70">
          <a
            href={site.phoneHref}
            className="flex items-center gap-2.5 transition-colors hover:text-white"
          >
            <Phone className="size-4" aria-hidden />
            {site.phone}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-2.5 transition-colors hover:text-white"
          >
            <Mail className="size-4" aria-hidden />
            {site.email}
          </a>
        </div>
      </div>
    </section>
  )
}
