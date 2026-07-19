import Image from "next/image"

import { cn } from "@workspace/ui/lib/utils"

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
  return (letters || source[0] || "?").toUpperCase()
}

const SIZES = { sm: 28, md: 40, lg: 72 } as const

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string | null
  email: string
  avatarUrl?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const px = SIZES[size]

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name ?? email}
        width={px}
        height={px}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
        className
      )}
      style={{ width: px, height: px, fontSize: px * 0.4 }}
    >
      {initials(name, email)}
    </span>
  )
}
