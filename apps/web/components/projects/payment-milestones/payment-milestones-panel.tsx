"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import { movePaymentMilestone } from "@/lib/actions/payment-milestones"
import { formatPaymentMilestoneTiming } from "@/lib/format"
import { sumMilestonePercentage } from "@/lib/payment-milestones"
import type { PlainPaymentMilestone } from "@/lib/data/serialize"

function MilestoneDetail({ milestone }: { milestone: PlainPaymentMilestone }) {
  if (milestone.timing === "AFTER_HANDOVER" && milestone.offsetMonths != null) {
    return <>{milestone.offsetMonths} mo. after handover</>
  }
  if (milestone.timing === "FIXED_DATE" && milestone.fixedDate) {
    return <>{new Date(milestone.fixedDate).toLocaleDateString("en-US")}</>
  }
  return milestone.note ? (
    <span className="text-muted-foreground">{milestone.note}</span>
  ) : (
    <>—</>
  )
}

function MoveMilestoneButtons({
  milestoneId,
  projectId,
  disableUp,
  disableDown,
}: {
  milestoneId: string
  projectId: string
  disableUp: boolean
  disableDown: boolean
}) {
  const [pending, startTransition] = React.useTransition()

  function move(direction: "up" | "down") {
    startTransition(async () => {
      try {
        await movePaymentMilestone(milestoneId, projectId, direction)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to reorder"
        )
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Move up"
        disabled={pending || disableUp}
        onClick={() => move("up")}
      >
        <ChevronUpIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Move down"
        disabled={pending || disableDown}
        onClick={() => move("down")}
      >
        <ChevronDownIcon />
      </Button>
    </>
  )
}

export function PaymentMilestonesPanel({
  projectId,
  milestones,
}: {
  projectId: string
  milestones: PlainPaymentMilestone[]
}) {
  const totalPercentage = sumMilestonePercentage(milestones)

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
        <PaymentMilestoneAiImportDialog projectId={projectId} />
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
                <TableHead>Timing</TableHead>
                <TableHead>Detail</TableHead>
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
                  <TableCell>
                    {formatPaymentMilestoneTiming(milestone.timing)}
                  </TableCell>
                  <TableCell>
                    <MilestoneDetail milestone={milestone} />
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <MoveMilestoneButtons
                      milestoneId={milestone.id}
                      projectId={projectId}
                      disableUp={index === 0}
                      disableDown={index === milestones.length - 1}
                    />
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
