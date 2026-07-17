"use client"

import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

export type SectionLink = { id: string; label: string }

/** Sticky left-rail navigation that tracks the section currently in view. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id)

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

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-28 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto lg:block"
    >
      <ul className="flex flex-col border-l border-ink/10">
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
