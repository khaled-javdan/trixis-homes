"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { FormField } from "@/components/form-field"
import {
  createPaymentMilestone,
  updatePaymentMilestone,
} from "@/lib/actions/payment-milestones"
import { formatPaymentMilestoneTiming } from "@/lib/format"
import type { PlainPaymentMilestone } from "@/lib/data/serialize"
import {
  paymentMilestoneTimingValues,
  type PaymentMilestoneInput,
} from "@workspace/db/validation/payment-milestone"

type FormValues = {
  label: string
  percentage: string
  timing: (typeof paymentMilestoneTimingValues)[number]
  offsetMonths: string
  fixedDate: string
  note: string
}

function toFormValues(milestone?: PlainPaymentMilestone): FormValues {
  return {
    label: milestone?.label ?? "",
    percentage: milestone?.percentage != null ? String(milestone.percentage) : "",
    timing: milestone?.timing ?? "ON_HANDOVER",
    offsetMonths:
      milestone?.offsetMonths != null ? String(milestone.offsetMonths) : "",
    fixedDate: milestone?.fixedDate ? milestone.fixedDate.slice(0, 10) : "",
    note: milestone?.note ?? "",
  }
}

function toInput(values: FormValues): PaymentMilestoneInput {
  return {
    label: values.label,
    percentage: Number(values.percentage),
    timing: values.timing,
    offsetMonths: values.offsetMonths ? Number(values.offsetMonths) : null,
    fixedDate: values.fixedDate ? new Date(values.fixedDate) : null,
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
  const isEdit = Boolean(milestone)
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const form = useForm<FormValues>({ defaultValues: toFormValues(milestone) })
  const timing = useWatch({ control: form.control, name: "timing" })

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

            <FormField label="Timing">
              <Controller
                control={form.control}
                name="timing"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMilestoneTimingValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatPaymentMilestoneTiming(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {timing === "AFTER_HANDOVER" && (
              <FormField
                label="Months After Handover"
                htmlFor="offsetMonths"
                className="sm:col-span-2"
              >
                <Input
                  id="offsetMonths"
                  type="number"
                  required
                  {...form.register("offsetMonths", { required: true })}
                />
              </FormField>
            )}

            {timing === "FIXED_DATE" && (
              <FormField
                label="Date"
                htmlFor="fixedDate"
                className="sm:col-span-2"
              >
                <Input
                  id="fixedDate"
                  type="date"
                  required
                  {...form.register("fixedDate", { required: true })}
                />
              </FormField>
            )}

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
