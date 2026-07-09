"use client"

import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { DeletePaymentMilestoneButton } from "@/components/projects/payment-milestones/delete-payment-milestone-button"
import { PaymentMilestoneAiImportDialog } from "@/components/projects/payment-milestones/payment-milestone-ai-import-dialog"
import { PaymentMilestoneFormDialog } from "@/components/projects/payment-milestones/payment-milestone-form-dialog"
import { formatDateShort } from "@/lib/format"
import {
  computeMilestoneDurations,
  formatMilestoneDuration,
  sumMilestonePercentage,
} from "@/lib/payment-milestones"
import type { PlainPaymentMilestone } from "@/lib/data/serialize"

export function PaymentMilestonesPanel({
  projectId,
  handoverDate,
  milestones,
}: {
  projectId: string
  handoverDate: string | null
  milestones: PlainPaymentMilestone[]
}) {
  const totalPercentage = sumMilestonePercentage(milestones)
  const durations = computeMilestoneDurations(milestones)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        {milestones.length > 0 ? (
          <Badge
            variant="outline"
            className={cn(
              totalPercentage !== 100 &&
                "border-amber-500/50 text-amber-600 dark:text-amber-400"
            )}
          >
            Total: {totalPercentage}%
          </Badge>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <PaymentMilestoneAiImportDialog
            projectId={projectId}
            handoverDate={handoverDate}
          />
          <PaymentMilestoneFormDialog projectId={projectId} />
        </div>
      </div>

      {milestones.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No payment milestones yet. Import one with AI above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((milestone, index) => (
                <TableRow key={milestone.id}>
                  <TableCell className="font-medium">
                    {milestone.label}
                  </TableCell>
                  <TableCell>{milestone.percentage}%</TableCell>
                  <TableCell>{formatDateShort(milestone.date)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatMilestoneDuration(durations[index]!)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {milestone.note ?? "—"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <PaymentMilestoneFormDialog
                      projectId={projectId}
                      milestone={milestone}
                    />
                    <DeletePaymentMilestoneButton
                      milestoneId={milestone.id}
                      projectId={projectId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
