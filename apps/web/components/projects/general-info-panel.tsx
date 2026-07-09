import type * as React from "react"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { formatDate, formatServiceCharge, normalizeUrl } from "@/lib/format"
import type { PlainProject } from "@/lib/data/serialize"

export function GeneralInfoPanel({ project }: { project: PlainProject }) {
  const linkHref = normalizeUrl(project.link)
  const fields: Array<[string, React.ReactNode]> = [
    ["Project Name", project.name],
    ["Developer", project.developer],
    [
      "Master Community",
      project.masterCommunity ? (
        <Link
          href={`/communities/${encodeURIComponent(project.masterCommunity)}`}
          className="text-primary underline underline-offset-2"
        >
          {project.masterCommunity}
        </Link>
      ) : null,
    ],
    ["Community", project.community],
    ["Location", project.location],
    ["Handover Date", formatDate(project.handoverDate)],
    [
      "Payment Plan",
      <span key="payment-plan" className="flex flex-wrap items-center gap-1.5">
        <span>{project.paymentPlan ?? "—"}</span>
        {project.promoPaymentPlan && (
          <Badge className="h-4.5 border-none bg-accent px-1.5 text-[10px] text-accent-foreground">
            Promo {project.promoPaymentPlan}
            {project.promoDownPaymentPercent != null
              ? ` (${project.promoDownPaymentPercent}% DP)`
              : ""}
          </Badge>
        )}
      </span>,
    ],
    [
      "Down Payment",
      project.downPaymentPercent != null
        ? `${project.downPaymentPercent}%`
        : null,
    ],
    [
      "Service Charge",
      project.serviceCharge != null
        ? `${formatServiceCharge(project.serviceCharge)}/sq.ft`
        : null,
    ],
    [
      "Link",
      linkHref ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 break-all"
        >
          {project.link}
        </a>
      ) : null,
    ],
  ]

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {project.description && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Description</p>
          <p className="text-sm whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {project.promotionNotes && (
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            Promotions
            <Badge className="h-4.5 border-none bg-accent px-1.5 text-[10px] text-accent-foreground">
              Q3
            </Badge>
          </p>
          <p className="text-sm whitespace-pre-wrap">
            {project.promotionNotes}
          </p>
        </div>
      )}
    </div>
  )
}
