"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGridIcon, StarIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

const links = [
  { href: "/", label: "Dashboard", icon: LayoutGridIcon },
  { href: "/favorites", label: "Favorites", icon: StarIcon },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" /> {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
