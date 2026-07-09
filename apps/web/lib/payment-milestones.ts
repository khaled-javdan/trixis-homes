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
