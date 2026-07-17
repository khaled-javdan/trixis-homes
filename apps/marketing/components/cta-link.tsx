import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

const variants = {
  copper: "bg-copper text-white hover:bg-copper-deep",
  "outline-light": "border border-white/40 text-white hover:border-white hover:bg-white/10",
  "outline-dark":
    "border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground/5",
} as const

export function CtaLink({
  href,
  variant = "copper",
  className,
  children,
  ...props
}: {
  href: string
  variant?: keyof typeof variants
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
