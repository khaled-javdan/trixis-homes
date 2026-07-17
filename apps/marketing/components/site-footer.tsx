import Image from "next/image"
import Link from "next/link"

import { InstagramIcon, LinkedInIcon } from "@/components/social-icons"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { nav, services, site } from "@/lib/content"

const socials = [
  { label: "Instagram", href: site.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: site.linkedin, Icon: LinkedInIcon },
  { label: "WhatsApp", href: site.whatsapp, Icon: WhatsAppIcon },
]

export function SiteFooter() {
  return (
    <footer className="bg-ink-deep pb-10 pt-20 text-white/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logo-light.svg"
              alt="Trixis Homes"
              width={70}
              height={49}
            />
            <p className="mt-6 max-w-xs text-sm/6">
              Dubai-born, globally connected. End-to-end property solutions for
              buyers, sellers, landlords, and investors.
            </p>
            <p className="mt-6 max-w-xs text-sm/6 text-white/50">
              {site.legalName}
              <br />
              {site.address}
            </p>
            <div className="mt-8 flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center border border-white/20 transition-colors hover:border-copper hover:text-copper"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Explore">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              Explore
            </h4>
            <ul className="mt-6 flex flex-col gap-3.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              Services
            </h4>
            <ul className="mt-6 flex flex-col gap-3.5">
              {services.map((service) => (
                <li key={service.title}>
                  <Link
                    href="#services"
                    className="text-sm transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              Contact
            </h4>
            <ul className="mt-6 flex flex-col gap-3.5 text-sm">
              <li>
                <a
                  href={site.phoneHref}
                  className="transition-colors hover:text-white"
                >
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-white"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p>{site.address}</p>
        </div>
      </div>
    </footer>
  )
}
