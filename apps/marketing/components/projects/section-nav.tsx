"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

export type SectionLink = { id: string; label: string }

/** Section navigation that tracks the section currently in view.
 * Desktop: sticky left rail. Mobile: sticky horizontal tab bar pinned
 * under the site header, auto-scrolled to keep the active tab visible. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id)
  const mobileListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    // The band sits a third down the viewport: a section becomes "active"
    // when its top crosses it, which matches reading order while scrolling.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    for (const section of sections) {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [sections])

  // Keep the active tab in view as the visitor scrolls through sections.
  useEffect(() => {
    const list = mobileListRef.current
    if (!list || list.scrollWidth <= list.clientWidth) return
    const link = list.querySelector<HTMLAnchorElement>('a[aria-current="true"]')
    link?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [active])

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-20 z-30 -mx-6 self-start border-b border-ink/10 bg-white/95 backdrop-blur-md lg:top-28 lg:mx-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none"
    >
      {/* Mobile: horizontal scrollable tabs */}
      <ul
        ref={mobileListRef}
        className="flex overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              aria-current={active === section.id || undefined}
              className={cn(
                "block whitespace-nowrap border-b-2 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                active === section.id
                  ? "border-copper text-copper"
                  : "border-transparent text-ink/55 hover:text-ink"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop: vertical rail */}
      <ul className="hidden flex-col border-l border-ink/10 lg:flex">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "-ml-px block border-l-2 py-2 pl-5 text-sm transition-colors",
                active === section.id
                  ? "border-copper font-medium text-copper"
                  : "border-transparent text-ink/55 hover:text-ink"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
