import { formatDate, formatDateShort } from "@/lib/format"
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

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

// Real payment plans in this app only ever specify relative timing (booking /
// during construction / handover / months after handover), never an exact
// calendar date except in the rare FIXED_DATE case — see the free-text
// paymentPlan examples in prisma/seed.ts. Handover itself is only known to
// quarter granularity (formatDate renders "Q1 2026"), so that's the most
// precision a computed date can offer here.
export function formatMilestoneDueDate(
  milestone: PlainPaymentMilestone,
  handoverDate: string | null
): string {
  switch (milestone.timing) {
    case "ON_BOOKING":
      return "On Booking"
    case "DURING_CONSTRUCTION":
      return "During Construction"
    case "ON_HANDOVER":
      return handoverDate ? (formatDate(handoverDate) ?? "On Handover") : "On Handover"
    case "AFTER_HANDOVER": {
      const months = milestone.offsetMonths ?? 0
      if (!handoverDate) return `${months} mo. after handover`
      return (
        formatDate(addMonths(new Date(handoverDate), months)) ??
        `${months} mo. after handover`
      )
    }
    case "FIXED_DATE":
      return milestone.fixedDate
        ? (formatDateShort(milestone.fixedDate) ?? "—")
        : "—"
  }
}
