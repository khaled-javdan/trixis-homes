import { communities } from "@/lib/content"

export function Ticker() {
  const items = [...communities, ...communities]
  return (
    <div className="relative overflow-hidden border-b border-border bg-background py-5">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent sm:w-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent sm:w-32"
        aria-hidden
      />
      <div className="animate-marquee flex w-max items-center">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="flex items-center font-heading text-sm uppercase tracking-[0.3em] text-primary/60"
            aria-hidden={i >= communities.length}
          >
            <span className="px-8">{name}</span>
            <span className="text-copper" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
