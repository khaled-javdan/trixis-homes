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
import { Switch } from "@workspace/ui/components/switch"
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
const ratingOptions = ["1", "2", "3", "4", "5"] as const

type ProjectFormValues = {
  name: string
  developer: string
  community: string
  city: string
  location: string
  status: (typeof statusOptions)[number]
  handoverQuarter: string
  handoverYear: string
  description: string
  paymentPlan: string
  downPaymentPercent: string
  promoPaymentPlan: string
  promoDownPaymentPercent: string
  promotionNotes: string
  serviceCharge: string
  amenities: string
  sellingPoints: string
  investmentRating: string
  luxuryRating: string
  familyRating: string
  waterfront: boolean
  golf: boolean
  brandedResidence: boolean
  brandName: string
  availableUnitsCount: string
  link: string
}

export type ProjectFormDefaults = {
  name?: string
  developer?: string
  community?: string | null
  city?: string | null
  location?: string
  status?: ProjectInput["status"]
  handoverDate?: string | Date | null
  description?: string | null
  paymentPlan?: string | null
  downPaymentPercent?: number | null
  promoPaymentPlan?: string | null
  promoDownPaymentPercent?: number | null
  promotionNotes?: string | null
  serviceCharge?: number | null
  amenities?: string[] | null
  sellingPoints?: string[] | null
  investmentRating?: number | null
  luxuryRating?: number | null
  familyRating?: number | null
  waterfront?: boolean | null
  golf?: boolean | null
  brandedResidence?: boolean | null
  brandName?: string | null
  availableUnitsCount?: number | null
  link?: string | null
}

function toFormValues(defaultValues?: ProjectFormDefaults): ProjectFormValues {
  const { quarter, year } = dateToQuarter(defaultValues?.handoverDate)
  return {
    name: defaultValues?.name ?? "",
    developer: defaultValues?.developer ?? "",
    community: defaultValues?.community ?? "",
    city: defaultValues?.city ?? "",
    location: defaultValues?.location ?? "",
    status: defaultValues?.status ?? "OFF_PLAN",
    handoverQuarter: quarter,
    handoverYear: year,
    description: defaultValues?.description ?? "",
    paymentPlan: defaultValues?.paymentPlan ?? "",
    downPaymentPercent:
      defaultValues?.downPaymentPercent != null
        ? String(defaultValues.downPaymentPercent)
        : "",
    promoPaymentPlan: defaultValues?.promoPaymentPlan ?? "",
    promoDownPaymentPercent:
      defaultValues?.promoDownPaymentPercent != null
        ? String(defaultValues.promoDownPaymentPercent)
        : "",
    promotionNotes: defaultValues?.promotionNotes ?? "",
    serviceCharge:
      defaultValues?.serviceCharge != null
        ? String(defaultValues.serviceCharge)
        : "",
    amenities: (defaultValues?.amenities ?? []).join("\n"),
    sellingPoints: (defaultValues?.sellingPoints ?? []).join("\n"),
    investmentRating:
      defaultValues?.investmentRating != null
        ? String(defaultValues.investmentRating)
        : "",
    luxuryRating:
      defaultValues?.luxuryRating != null
        ? String(defaultValues.luxuryRating)
        : "",
    familyRating:
      defaultValues?.familyRating != null
        ? String(defaultValues.familyRating)
        : "",
    waterfront: defaultValues?.waterfront ?? false,
    golf: defaultValues?.golf ?? false,
    brandedResidence: defaultValues?.brandedResidence ?? false,
    brandName: defaultValues?.brandName ?? "",
    availableUnitsCount:
      defaultValues?.availableUnitsCount != null
        ? String(defaultValues.availableUnitsCount)
        : "",
    link: defaultValues?.link ?? "",
  }
}

function toStringArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
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
          city: values.city,
          location: values.location,
          status: values.status,
          handoverDate: quarterToDate(
            values.handoverQuarter,
            values.handoverYear
          ),
          description: values.description,
          paymentPlan: values.paymentPlan,
          downPaymentPercent: values.downPaymentPercent
            ? Number(values.downPaymentPercent)
            : null,
          promoPaymentPlan: values.promoPaymentPlan,
          promoDownPaymentPercent: values.promoDownPaymentPercent
            ? Number(values.promoDownPaymentPercent)
            : null,
          promotionNotes: values.promotionNotes,
          serviceCharge: values.serviceCharge
            ? Number(values.serviceCharge)
            : null,
          amenities: toStringArray(values.amenities),
          sellingPoints: toStringArray(values.sellingPoints),
          investmentRating: values.investmentRating
            ? Number(values.investmentRating)
            : null,
          luxuryRating: values.luxuryRating ? Number(values.luxuryRating) : null,
          familyRating: values.familyRating ? Number(values.familyRating) : null,
          waterfront: values.waterfront,
          golf: values.golf,
          brandedResidence: values.brandedResidence,
          brandName: values.brandName,
          availableUnitsCount: values.availableUnitsCount
            ? Number(values.availableUnitsCount)
            : null,
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
        <FormField label="City (optional)" htmlFor="city">
          <Input
            id="city"
            placeholder="e.g. Dubai, Abu Dhabi"
            {...form.register("city")}
          />
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
        <FormField label="Payment Plan (optional)" htmlFor="paymentPlan">
          <Input
            id="paymentPlan"
            placeholder="e.g. 60/40"
            {...form.register("paymentPlan")}
          />
        </FormField>
        <FormField
          label="Down Payment % (optional)"
          htmlFor="downPaymentPercent"
        >
          <Input
            id="downPaymentPercent"
            type="number"
            placeholder="e.g. 15"
            {...form.register("downPaymentPercent")}
          />
        </FormField>
        <FormField
          label="Promo Payment Plan (optional)"
          htmlFor="promoPaymentPlan"
        >
          <Input
            id="promoPaymentPlan"
            placeholder="e.g. 40/60"
            {...form.register("promoPaymentPlan")}
          />
        </FormField>
        <FormField
          label="Promo Down Payment % (optional)"
          htmlFor="promoDownPaymentPercent"
        >
          <Input
            id="promoDownPaymentPercent"
            type="number"
            placeholder="e.g. 5"
            {...form.register("promoDownPaymentPercent")}
          />
        </FormField>
        <FormField
          label="Service Charge (AED/sq ft, optional)"
          htmlFor="serviceCharge"
        >
          <Input
            id="serviceCharge"
            type="number"
            step="0.01"
            {...form.register("serviceCharge")}
          />
        </FormField>
        <FormField
          label="Available Units (optional)"
          htmlFor="availableUnitsCount"
        >
          <Input
            id="availableUnitsCount"
            type="number"
            {...form.register("availableUnitsCount")}
          />
        </FormField>
        <FormField label="Investment Rating (optional)">
          <Controller
            control={form.control}
            name="investmentRating"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unrated" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      {rating} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Luxury Rating (optional)">
          <Controller
            control={form.control}
            name="luxuryRating"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unrated" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      {rating} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label="Family Rating (optional)">
          <Controller
            control={form.control}
            name="familyRating"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unrated" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((rating) => (
                    <SelectItem key={rating} value={rating}>
                      {rating} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Controller
              control={form.control}
              name="waterfront"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            Waterfront
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Controller
              control={form.control}
              name="golf"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            Golf
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Controller
              control={form.control}
              name="brandedResidence"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            Branded Residence
          </label>
        </div>
        <Controller
          control={form.control}
          name="brandedResidence"
          render={({ field }) =>
            field.value ? (
              <FormField
                label="Brand Name (optional)"
                htmlFor="brandName"
                className="sm:col-span-2"
              >
                <Input
                  id="brandName"
                  placeholder="e.g. Armani, Fendi"
                  {...form.register("brandName")}
                />
              </FormField>
            ) : (
              <></>
            )
          }
        />
        <FormField
          label="Amenities (optional, one per line)"
          htmlFor="amenities"
          className="sm:col-span-2"
        >
          <Textarea
            id="amenities"
            rows={3}
            placeholder={"Infinity pool\nGym\nKids play area"}
            {...form.register("amenities")}
          />
        </FormField>
        <FormField
          label="Selling Points (optional, one per line)"
          htmlFor="sellingPoints"
          className="sm:col-span-2"
        >
          <Textarea
            id="sellingPoints"
            rows={3}
            placeholder={"5-minute walk to the beach\nZero commission for a limited time"}
            {...form.register("sellingPoints")}
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
        <FormField
          label="Promotion Notes (optional)"
          htmlFor="promotionNotes"
          className="sm:col-span-2"
        >
          <Textarea
            id="promotionNotes"
            rows={2}
            placeholder="e.g. 2% ADM Waiver, 5% Broker Commission"
            {...form.register("promotionNotes")}
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
