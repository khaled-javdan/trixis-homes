"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { PencilIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"

import { FormField } from "@/components/form-field"
import { useIsAdmin } from "@/components/admin-provider"
import {
  createPaymentMilestone,
  updatePaymentMilestone,
} from "@/lib/actions/payment-milestones"
import type { PlainPaymentMilestone } from "@/lib/data/serialize"
import type { PaymentMilestoneInput } from "@workspace/db/validation/payment-milestone"

type FormValues = {
  label: string
  percentage: string
  date: string
  note: string
}

function toFormValues(milestone?: PlainPaymentMilestone): FormValues {
  return {
    label: milestone?.label ?? "",
    percentage: milestone?.percentage != null ? String(milestone.percentage) : "",
    date: milestone?.date ? milestone.date.slice(0, 10) : "",
    note: milestone?.note ?? "",
  }
}

function toInput(values: FormValues): PaymentMilestoneInput {
  return {
    label: values.label,
    percentage: Number(values.percentage),
    date: new Date(values.date),
    note: values.note,
  }
}

export function PaymentMilestoneFormDialog({
  projectId,
  milestone,
}: {
  projectId: string
  milestone?: PlainPaymentMilestone
}) {
  const isAdmin = useIsAdmin()
  const isEdit = Boolean(milestone)
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const form = useForm<FormValues>({ defaultValues: toFormValues(milestone) })

  if (!isAdmin) return null

  function save(values: FormValues) {
    startTransition(async () => {
      try {
        const input = toInput(values)
        if (isEdit && milestone) {
          await updatePaymentMilestone(milestone.id, projectId, input)
          toast.success("Milestone updated")
        } else {
          await createPaymentMilestone(projectId, input)
          toast.success("Milestone added")
        }
        setOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong"
        )
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) form.reset(toFormValues(milestone))
      }}
    >
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {isEdit ? (
          <PencilIcon />
        ) : (
          <>
            <PlusIcon /> Add Milestone
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Milestone" : "Add Milestone"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(save)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Label"
              htmlFor="label"
              className="sm:col-span-2"
            >
              <Input
                id="label"
                placeholder="e.g. Booking, Handover"
                required
                {...form.register("label", { required: true })}
              />
            </FormField>

            <FormField label="Percentage (%)" htmlFor="percentage">
              <Input
                id="percentage"
                type="number"
                step="0.01"
                required
                {...form.register("percentage", { required: true })}
              />
            </FormField>

            <FormField label="Date" htmlFor="date">
              <Input
                id="date"
                type="date"
                required
                {...form.register("date", { required: true })}
              />
            </FormField>

            <FormField
              label="Note (optional)"
              htmlFor="note"
              className="sm:col-span-2"
            >
              <Input
                id="note"
                placeholder="e.g. on 30% construction completion"
                {...form.register("note")}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
