import { formatMonthYear } from "@/lib/format"
import type { PlainPaymentMilestone } from "@/lib/data/serialize"

export function sumMilestonePercentage(
  milestones: { percentage: number }[]
): number {
  return milestones.reduce((sum, milestone) => sum + milestone.percentage, 0)
}

export function computeMilestoneAmount(
  percentage: number,
  startingPrice: number
): number {
  return (percentage / 100) * startingPrice
}

export function formatMilestoneDate(milestone: PlainPaymentMilestone): string {
  return formatMonthYear(milestone.date) ?? "—"
}

function daysBetween(start: Date, end: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  )
}

export type MilestoneDuration = { days: number; months: number }

// Days/months elapsed since the plan's first milestone (typically booking),
// so a breakdown can be quoted the way developers do it — "60 days" /
// "Month 2" — not just a calendar date. Milestones must already be sorted
// chronologically (getProjectDetail orders paymentMilestones by date asc).
export function computeMilestoneDurations(
  milestones: PlainPaymentMilestone[]
): MilestoneDuration[] {
  if (milestones.length === 0) return []
  const start = new Date(milestones[0]!.date)
  return milestones.map((milestone) => {
    const end = new Date(milestone.date)
    return {
      days: daysBetween(start, end),
      months: monthsBetween(start, end),
    }
  })
}

export function formatMilestoneDuration({ days, months }: MilestoneDuration): string {
  return `${days} day${days === 1 ? "" : "s"} · Month ${months}`
}

export type YearlyRollupRow = {
  year: number
  percentage: number
  amount: number
}

export function groupMilestonesByYear(
  milestones: PlainPaymentMilestone[],
  startingPrice: number
): YearlyRollupRow[] {
  const byYear = new Map<number, number>()
  for (const milestone of milestones) {
    const year = new Date(milestone.date).getFullYear()
    byYear.set(year, (byYear.get(year) ?? 0) + milestone.percentage)
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, percentage]) => ({
      year,
      percentage,
      amount: computeMilestoneAmount(percentage, startingPrice),
    }))
}
