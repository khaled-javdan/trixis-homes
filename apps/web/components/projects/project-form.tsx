"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
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
import {
  dateToQuarter,
  formatProjectStatus,
  quarterToDate,
  quarterValues,
} from "@/lib/format"
import type { ProjectInput } from "@workspace/db/validation/project"

const statusOptions = ["OFF_PLAN", "UNDER_CONSTRUCTION", "READY"] as const

type ProjectFormValues = {
  name: string
  developer: string
  community: string
  location: string
  status: (typeof statusOptions)[number]
  handoverQuarter: string
  handoverYear: string
  description: string
  paymentPlan: string
  link: string
}

export type ProjectFormDefaults = {
  name?: string
  developer?: string
  community?: string | null
  location?: string
  status?: ProjectInput["status"]
  handoverDate?: string | Date | null
  description?: string | null
  paymentPlan?: string | null
  link?: string | null
}

function toFormValues(defaultValues?: ProjectFormDefaults): ProjectFormValues {
  const { quarter, year } = dateToQuarter(defaultValues?.handoverDate)
  return {
    name: defaultValues?.name ?? "",
    developer: defaultValues?.developer ?? "",
    community: defaultValues?.community ?? "",
    location: defaultValues?.location ?? "",
    status: defaultValues?.status ?? "OFF_PLAN",
    handoverQuarter: quarter,
    handoverYear: year,
    description: defaultValues?.description ?? "",
    paymentPlan: defaultValues?.paymentPlan ?? "",
    link: defaultValues?.link ?? "",
  }
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
}: {
  defaultValues?: ProjectFormDefaults
  onSubmit: (input: ProjectInput) => Promise<void>
  submitLabel?: string
}) {
  const form = useForm<ProjectFormValues>({
    defaultValues: toFormValues(defaultValues),
  })
  const [pending, startTransition] = React.useTransition()

  function submit(values: ProjectFormValues) {
    startTransition(async () => {
      try {
        const input: ProjectInput = {
          name: values.name,
          developer: values.developer,
          community: values.community,
          location: values.location,
          status: values.status,
          handoverDate: quarterToDate(
            values.handoverQuarter,
            values.handoverYear
          ),
          description: values.description,
          paymentPlan: values.paymentPlan,
          link: values.link,
        }
        await onSubmit(input)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong"
        )
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Project Name" htmlFor="name">
          <Input
            id="name"
            autoFocus
            required
            {...form.register("name", { required: true })}
          />
        </FormField>
        <FormField label="Developer" htmlFor="developer">
          <Input
            id="developer"
            required
            {...form.register("developer", { required: true })}
          />
        </FormField>
        <FormField label="Community (optional)" htmlFor="community">
          <Input id="community" {...form.register("community")} />
        </FormField>
        <FormField label="Location" htmlFor="location">
          <Input
            id="location"
            required
            {...form.register("location", { required: true })}
          />
        </FormField>
        <FormField label="Status">
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatProjectStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Handover Date (optional)">
          <div className="flex gap-2">
            <Controller
              control={form.control}
              name="handoverQuarter"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarterValues.map((quarter) => (
                      <SelectItem key={quarter} value={quarter}>
                        {`Q${quarter}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Year"
              {...form.register("handoverYear")}
            />
          </div>
        </FormField>
        <FormField
          label="Payment Plan (optional)"
          htmlFor="paymentPlan"
          className="sm:col-span-2"
        >
          <Input
            id="paymentPlan"
            placeholder="e.g. 60/40"
            {...form.register("paymentPlan")}
          />
        </FormField>
        <FormField
          label="Link (optional)"
          htmlFor="link"
          className="sm:col-span-2"
        >
          <Input
            id="link"
            type="url"
            placeholder="https://..."
            {...form.register("link")}
          />
        </FormField>
        <FormField
          label="Description (optional)"
          htmlFor="description"
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            rows={4}
            {...form.register("description")}
          />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
