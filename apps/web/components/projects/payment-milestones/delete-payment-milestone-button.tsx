"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { deletePaymentMilestone } from "@/lib/actions/payment-milestones"

export function DeletePaymentMilestoneButton({
  milestoneId,
  projectId,
}: {
  milestoneId: string
  projectId: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Delete milestone"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await deletePaymentMilestone(milestoneId, projectId)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to delete milestone"
            )
          }
        })
      }}
    >
      <XIcon className="size-3.5" />
    </Button>
  )
}
