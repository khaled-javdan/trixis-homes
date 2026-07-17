"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, Phone, X } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { nav, site } from "@/lib/content"

// Section ids behind the home-page anchor links ("/#services" → "services"),
// observed for scrollspy highlighting while on the home page.
const anchorSectionIds = nav
  .filter((item) => item.href.startsWith("/#"))
  .map((item) => item.href.slice(2))

export function SiteHeader({
  variant = "overlay",
}: {
  // "overlay" floats transparent over a dark hero; "solid" renders the
  // scrolled treatment from the start, for pages without a dark hero.
  variant?: "overlay" | "solid"
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scrollspy for the home page's in-page sections. A section counts as
  // active while its slice crosses a band a third down the viewport; between
  // sections (e.g. over the hero) nothing is highlighted.
  useEffect(() => {
    if (pathname !== "/") return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          } else {
            setActiveSection((current) =>
              current === entry.target.id ? null : current
            )
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    for (const id of anchorSectionIds) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [pathname])

  function isActive(href: string): boolean {
    if (href.startsWith("/#")) {
      return pathname === "/" && activeSection === href.slice(2)
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Light (inverted) treatment while floating over the dark hero.
  const overHero = variant === "overlay" && !scrolled && !open

  return (
    <>
      <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        overHero
          ? "bg-transparent text-white"
          : "border-b border-border bg-background/95 text-foreground backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label="Trixis Homes — home" onClick={() => setOpen(false)}>
          <Image
            src={overHero ? "/logo-light.svg" : "/logo.svg"}
            alt="Trixis Homes"
            width={62}
            height={44}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-copper"
                    : overHero
                      ? "text-white/75 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-6">
          <a
            href={site.phoneHref}
            className={cn(
              "hidden items-center gap-2 text-sm tracking-wide transition-colors xl:flex",
              overHero
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Phone className="size-3.5" aria-hidden />
            {site.phone}
          </a>
          <Link
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden bg-copper px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-copper-deep sm:inline-flex"
          >
            Book a Call
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      </header>

      {/* Kept outside the header: its backdrop-blur creates a containing
          block that would collapse this fixed-position panel. */}
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-20 z-40 flex flex-col gap-2 overflow-y-auto border-t border-border bg-background px-8 pb-10 pt-10 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "border-b border-border py-5 font-heading text-2xl",
                isActive(item.href) ? "text-copper" : "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.phoneHref}
            className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"
          >
            <Phone className="size-4" aria-hidden />
            {site.phone}
          </a>
        </div>
      ) : null}
    </>
  )
}
