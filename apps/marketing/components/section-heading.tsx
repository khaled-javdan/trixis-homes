import { cn } from "@workspace/ui/lib/utils"

export function Eyebrow({
  children,
  centered,
  className,
}: {
  children: React.ReactNode
  centered?: boolean
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-copper",
        centered && "justify-center",
        className
      )}
    >
      <span aria-hidden className="h-px w-10 bg-copper" />
      {children}
      {centered && <span aria-hidden className="h-px w-10 bg-copper" />}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  className,
}: {
  eyebrow: string
  title: string
  lede?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-14 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 font-heading text-3xl leading-[1.12] text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </div>
      {lede ? (
        <p className="max-w-md text-sm/6 text-muted-foreground lg:pb-1.5">{lede}</p>
      ) : null}
    </div>
  )
}
