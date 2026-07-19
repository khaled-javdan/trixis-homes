"use client"

import { useEffect, useState } from "react"

import { stats } from "@/lib/content"

// Splits "5K+" / "90%" / "$3B+" into prefix, numeric part, and suffix so the
// number alone can count up while the framing stays put.
const NUMBER_PATTERN = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/

const DURATION_MS = 1400

function StatValue({ value, delayMs }: { value: string; delayMs: number }) {
  // Server-renders (and no-JS renders) the final value; the count-up only
  // kicks in after hydration, and never under prefers-reduced-motion.
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const match = value.match(NUMBER_PATTERN)
    if (!match) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const [, prefix, numeric, suffix] = match as unknown as [
      string,
      string,
      string,
      string,
    ]
    const target = parseFloat(numeric)
    const decimals = numeric.includes(".") ? 1 : 0
    const start = performance.now() + delayMs
    let frame: number

    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / DURATION_MS, 0), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, delayMs])

  return <>{display}</>
}

export function HeroStats() {
  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/15 pt-8 sm:mt-16 sm:gap-x-8 sm:gap-y-10 sm:pt-10 lg:mt-20 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={stat.label}>
          <dd className="font-heading text-3xl tabular-nums sm:text-4xl">
            <StatValue value={stat.value} delayMs={400 + index * 120} />
          </dd>
          <dt className="mt-2 text-[10px] tracking-[0.15em] text-ink/55 uppercase sm:text-[11px]">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
