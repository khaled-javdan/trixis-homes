import Link from "next/link"
import type { ComponentProps } from "react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ButtonLinkProps = ComponentProps<typeof Link> &
  NonNullable<Parameters<typeof buttonVariants>[0]>

/**
 * A `<Link>` styled like a Button. Base UI's Button `render` prop is only meant for
 * elements that can take on native button semantics — anchors have their own
 * semantics, so links must never be passed through `Button`'s `render` prop.
 */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
