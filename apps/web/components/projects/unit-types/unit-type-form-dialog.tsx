"use client"
/* eslint-disable react-hooks/refs -- firstFieldRef is only ever read inside the async transition after submit, never during render */

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
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
import { Textarea } from "@workspace/ui/components/textarea"

import { FormField } from "@/components/form-field"
import { createUnitType, updateUnitType } from "@/lib/actions/unit-types"
import { formatUnitCategory } from "@/lib/format"
import type { PlainUnitType } from "@/lib/data/serialize"
import {
  unitCategoryValues,
  type UnitTypeInput,
} from "@workspace/db/validation/unit-type"

type FormValues = {
  category: (typeof unitCategoryValues)[number]
  label: string
  unitCount: string
  startingPrice: string
  size: string
  plotSize: string
  bua: string
  bedrooms: string
  bathrooms: string
  parking: string
  paymentPlan: string
  notes: string
}

function toFormValues(unit?: PlainUnitType): FormValues {
  return {
    category: unit?.category ?? "STUDIO",
    label: unit?.label ?? "",
    unitCount: unit?.unitCount != null ? String(unit.unitCount) : "",
    startingPrice:
      unit?.startingPrice != null ? String(unit.startingPrice) : "",
    size: unit?.size != null ? String(unit.size) : "",
    plotSize: unit?.plotSize != null ? String(unit.plotSize) : "",
    bua: unit?.bua != null ? String(unit.bua) : "",
    bedrooms: unit?.bedrooms != null ? String(unit.bedrooms) : "",
    bathrooms: unit?.bathrooms != null ? String(unit.bathrooms) : "",
    parking: unit?.parking != null ? String(unit.parking) : "",
    paymentPlan: unit?.paymentPlan ?? "",
    notes: unit?.notes ?? "",
  }
}

function toInput(values: FormValues): UnitTypeInput {
  return {
    category: values.category,
    label: values.label,
    unitCount: values.unitCount ? Number(values.unitCount) : null,
    startingPrice: Number(values.startingPrice),
    size: values.size ? Number(values.size) : null,
    plotSize: values.plotSize ? Number(values.plotSize) : null,
    bua: values.bua ? Number(values.bua) : null,
    bedrooms: values.bedrooms ? Number(values.bedrooms) : null,
    bathrooms: values.bathrooms ? Number(values.bathrooms) : null,
    parking: values.parking ? Number(values.parking) : null,
    paymentPlan: values.paymentPlan,
    notes: values.notes,
  }
}

export function UnitTypeFormDialog({
  projectId,
  unit,
}: {
  projectId: string
  unit?: PlainUnitType
}) {
  const isEdit = Boolean(unit)
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()
  const firstFieldRef = React.useRef<HTMLButtonElement>(null)
  const form = useForm<FormValues>({ defaultValues: toFormValues(unit) })

  function save(values: FormValues, keepOpen: boolean) {
    startTransition(async () => {
      try {
        const input = toInput(values)
        if (isEdit && unit) {
          await updateUnitType(unit.id, projectId, input)
          toast.success("Unit type updated")
          setOpen(false)
        } else {
          await createUnitType(projectId, input)
          toast.success("Unit type added")
          if (keepOpen) {
            form.reset(toFormValues())
            firstFieldRef.current?.focus()
          } else {
            setOpen(false)
          }
        }
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
        if (next) form.reset(toFormValues(unit))
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
            <PlusIcon /> Add Unit Type
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Unit Type" : "Add Unit Type"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => save(values, false))}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Unit Type">
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" ref={firstFieldRef}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitCategoryValues.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatUnitCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Label (optional)"
              htmlFor="label"
              className="sm:col-span-2"
            >
              <Input
                id="label"
                placeholder="e.g. 3BR + Maid's Room"
                {...form.register("label")}
              />
            </FormField>

            <FormField label="Starting Price (AED)" htmlFor="startingPrice">
              <Input
                id="startingPrice"
                type="number"
                required
                {...form.register("startingPrice", { required: true })}
              />
            </FormField>
            <FormField label="Size (sq ft)" htmlFor="size">
              <Input id="size" type="number" {...form.register("size")} />
            </FormField>
            <FormField label="Plot Size (sq ft)" htmlFor="plotSize">
              <Input
                id="plotSize"
                type="number"
                {...form.register("plotSize")}
              />
            </FormField>

            <FormField label="BUA (sq ft)" htmlFor="bua">
              <Input id="bua" type="number" {...form.register("bua")} />
            </FormField>
            <FormField label="Bedrooms" htmlFor="bedrooms">
              <Input
                id="bedrooms"
                type="number"
                {...form.register("bedrooms")}
              />
            </FormField>
            <FormField label="Bathrooms" htmlFor="bathrooms">
              <Input
                id="bathrooms"
                type="number"
                {...form.register("bathrooms")}
              />
            </FormField>

            <FormField label="Parking" htmlFor="parking">
              <Input id="parking" type="number" {...form.register("parking")} />
            </FormField>
            <FormField label="Number of Units" htmlFor="unitCount">
              <Input
                id="unitCount"
                type="number"
                {...form.register("unitCount")}
              />
            </FormField>
            <FormField
              label="Payment Plan Override (optional)"
              htmlFor="paymentPlan"
              className="sm:col-span-2"
            >
              <Input
                id="paymentPlan"
                placeholder="Leave blank to use project default"
                {...form.register("paymentPlan")}
              />
            </FormField>

            <FormField
              label="Notes (optional)"
              htmlFor="notes"
              className="sm:col-span-3"
            >
              <Textarea id="notes" rows={3} {...form.register("notes")} />
            </FormField>
          </div>

          <div className="flex justify-end gap-2">
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={form.handleSubmit((values) => save(values, true))}
              >
                Save &amp; add another
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
