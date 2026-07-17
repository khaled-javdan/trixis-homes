"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SparklesIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
  createProjectsFromExtraction,
  extractProjectsFromText,
} from "@/lib/actions/ai-import"
import {
  DIRHAM_SIGN,
  dateToQuarter,
  formatProjectStatus,
  formatPropertyType,
  quarterToDate,
  quarterValues,
} from "@/lib/format"
import { projectStatusValues } from "@workspace/db/validation/project"
import type { ProjectInput } from "@workspace/db/validation/project"
import {
  propertyTypeValues,
  type UnitTypeInput,
} from "@workspace/db/validation/unit-type"
import type { ExtractedProject } from "@workspace/db/validation/ai-import"

type UnitTypeDraft = {
  propertyType: (typeof propertyTypeValues)[number]
  label: string
  unitCount: string
  bedrooms: string
  startingPrice: string
  size: string
  plotSize: string
  bua: string
  bathrooms: string
  parking: string
  paymentPlan: string
  serviceCharge: string
  notes: string
}

const ratingOptions = ["1", "2", "3", "4", "5"] as const

type ProjectDraft = {
  name: string
  developer: string
  community: string
  city: string
  location: string
  status: (typeof projectStatusValues)[number]
  launchDate: string
  handoverDate: string
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
  unitTypes: UnitTypeDraft[]
}

function emptyUnitTypeDraft(): UnitTypeDraft {
  return {
    propertyType: "APARTMENT",
    label: "",
    unitCount: "",
    bedrooms: "",
    startingPrice: "",
    size: "",
    plotSize: "",
    bua: "",
    bathrooms: "",
    parking: "",
    paymentPlan: "",
    serviceCharge: "",
    notes: "",
  }
}

function toUnitTypeDraft(unit: ExtractedProject["unitTypes"][number]): UnitTypeDraft {
  return {
    propertyType: unit.propertyType,
    label: unit.label ?? "",
    unitCount: unit.unitCount != null ? String(unit.unitCount) : "",
    bedrooms: unit.bedrooms != null ? String(unit.bedrooms) : "",
    startingPrice: unit.startingPrice != null ? String(unit.startingPrice) : "",
    size: unit.size != null ? String(unit.size) : "",
    plotSize: unit.plotSize != null ? String(unit.plotSize) : "",
    bua: unit.bua != null ? String(unit.bua) : "",
    bathrooms: unit.bathrooms != null ? String(unit.bathrooms) : "",
    parking: unit.parking != null ? String(unit.parking) : "",
    paymentPlan: unit.paymentPlan ?? "",
    serviceCharge: unit.serviceCharge != null ? String(unit.serviceCharge) : "",
    notes: unit.notes ?? "",
  }
}

function toStringArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function toProjectDraft(project: ExtractedProject): ProjectDraft {
  return {
    name: project.name ?? "",
    developer: project.developer ?? "",
    community: project.community ?? "",
    city: project.city ?? "",
    location: project.location ?? "",
    status: project.status ?? "OFF_PLAN",
    launchDate: project.launchDate ?? "",
    handoverDate: project.handoverDate ?? "",
    description: project.description ?? "",
    paymentPlan: project.paymentPlan ?? "",
    downPaymentPercent:
      project.downPaymentPercent != null
        ? String(project.downPaymentPercent)
        : "",
    promoPaymentPlan: project.promoPaymentPlan ?? "",
    promoDownPaymentPercent:
      project.promoDownPaymentPercent != null
        ? String(project.promoDownPaymentPercent)
        : "",
    promotionNotes: project.promotionNotes ?? "",
    serviceCharge:
      project.serviceCharge != null ? String(project.serviceCharge) : "",
    amenities: project.amenities.join("\n"),
    sellingPoints: project.sellingPoints.join("\n"),
    investmentRating:
      project.investmentRating != null ? String(project.investmentRating) : "",
    luxuryRating:
      project.luxuryRating != null ? String(project.luxuryRating) : "",
    familyRating:
      project.familyRating != null ? String(project.familyRating) : "",
    waterfront: project.waterfront,
    golf: project.golf,
    brandedResidence: project.brandedResidence,
    brandName: project.brandName ?? "",
    availableUnitsCount:
      project.availableUnitsCount != null
        ? String(project.availableUnitsCount)
        : "",
    unitTypes: project.unitTypes.map(toUnitTypeDraft),
  }
}

function emptyProjectDraft(): ProjectDraft {
  return {
    name: "",
    developer: "",
    community: "",
    city: "",
    location: "",
    status: "OFF_PLAN",
    launchDate: "",
    handoverDate: "",
    description: "",
    paymentPlan: "",
    downPaymentPercent: "",
    promoPaymentPlan: "",
    promoDownPaymentPercent: "",
    promotionNotes: "",
    serviceCharge: "",
    amenities: "",
    sellingPoints: "",
    investmentRating: "",
    luxuryRating: "",
    familyRating: "",
    waterfront: false,
    golf: false,
    brandedResidence: false,
    brandName: "",
    availableUnitsCount: "",
    unitTypes: [emptyUnitTypeDraft()],
  }
}

function toProjectInput(draft: ProjectDraft): ProjectInput {
  return {
    name: draft.name,
    developer: draft.developer,
    community: draft.community,
    city: draft.city,
    location: draft.location,
    status: draft.status,
    launchDate: draft.launchDate ? new Date(draft.launchDate) : null,
    handoverDate: draft.handoverDate ? new Date(draft.handoverDate) : null,
    description: draft.description,
    paymentPlan: draft.paymentPlan,
    downPaymentPercent: draft.downPaymentPercent
      ? Number(draft.downPaymentPercent)
      : null,
    promoPaymentPlan: draft.promoPaymentPlan,
    promoDownPaymentPercent: draft.promoDownPaymentPercent
      ? Number(draft.promoDownPaymentPercent)
      : null,
    promotionNotes: draft.promotionNotes,
    serviceCharge: draft.serviceCharge ? Number(draft.serviceCharge) : null,
    amenities: toStringArray(draft.amenities),
    sellingPoints: toStringArray(draft.sellingPoints),
    investmentRating: draft.investmentRating
      ? Number(draft.investmentRating)
      : null,
    luxuryRating: draft.luxuryRating ? Number(draft.luxuryRating) : null,
    familyRating: draft.familyRating ? Number(draft.familyRating) : null,
    waterfront: draft.waterfront,
    golf: draft.golf,
    brandedResidence: draft.brandedResidence,
    brandName: draft.brandName,
    availableUnitsCount: draft.availableUnitsCount
      ? Number(draft.availableUnitsCount)
      : null,
  }
}

function toUnitTypeInputs(draft: ProjectDraft): UnitTypeInput[] {
  return draft.unitTypes.map((unit) => ({
    propertyType: unit.propertyType,
    label: unit.label,
    unitCount: unit.unitCount ? Number(unit.unitCount) : null,
    startingPrice: Number(unit.startingPrice),
    size: unit.size ? Number(unit.size) : null,
    plotSize: unit.plotSize ? Number(unit.plotSize) : null,
    bua: unit.bua ? Number(unit.bua) : null,
    bedrooms: unit.bedrooms ? Number(unit.bedrooms) : null,
    bathrooms: unit.bathrooms ? Number(unit.bathrooms) : null,
    parking: unit.parking ? Number(unit.parking) : null,
    paymentPlan: unit.paymentPlan,
    serviceCharge: unit.serviceCharge ? Number(unit.serviceCharge) : null,
    notes: unit.notes,
  }))
}

function findMissingFields(drafts: ProjectDraft[]): string | null {
  for (const [index, draft] of drafts.entries()) {
    const label = `Project ${index + 1}`
    if (!draft.name.trim()) return `${label}: name is required`
    if (!draft.developer.trim()) return `${label}: developer is required`
    if (!draft.location.trim()) return `${label}: location is required`
    if (draft.unitTypes.length === 0)
      return `${label}: add at least one unit type`
    for (const unit of draft.unitTypes) {
      const price = Number(unit.startingPrice)
      if (!unit.startingPrice || !(price > 0))
        return `${label}: every unit type needs a starting price`
    }
  }
  return null
}

export function AiImportFlow() {
  const router = useRouter()
  const [text, setText] = React.useState("")
  const [drafts, setDrafts] = React.useState<ProjectDraft[] | null>(null)
  const [extracting, startExtracting] = React.useTransition()
  const [creating, startCreating] = React.useTransition()

  function handleExtract() {
    if (!text.trim()) return
    startExtracting(async () => {
      try {
        const projects = await extractProjectsFromText(text)
        if (projects.length === 0) {
          toast.error("Couldn't find any projects in that text")
          return
        }
        setDrafts(projects.map(toProjectDraft))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to parse text"
        )
      }
    })
  }

  function updateProject(index: number, patch: Partial<ProjectDraft>) {
    setDrafts((prev) =>
      prev
        ? prev.map((draft, i) => (i === index ? { ...draft, ...patch } : draft))
        : prev
    )
  }

  function updateUnitType(
    projectIndex: number,
    unitIndex: number,
    patch: Partial<UnitTypeDraft>
  ) {
    setDrafts((prev) =>
      prev
        ? prev.map((draft, i) =>
            i === projectIndex
              ? {
                  ...draft,
                  unitTypes: draft.unitTypes.map((unit, j) =>
                    j === unitIndex ? { ...unit, ...patch } : unit
                  ),
                }
              : draft
          )
        : prev
    )
  }

  function removeProject(index: number) {
    setDrafts((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  function addProject() {
    setDrafts((prev) => [...(prev ?? []), emptyProjectDraft()])
  }

  function addUnitType(projectIndex: number) {
    setDrafts((prev) =>
      prev
        ? prev.map((draft, i) =>
            i === projectIndex
              ? { ...draft, unitTypes: [...draft.unitTypes, emptyUnitTypeDraft()] }
              : draft
          )
        : prev
    )
  }

  function removeUnitType(projectIndex: number, unitIndex: number) {
    setDrafts((prev) =>
      prev
        ? prev.map((draft, i) =>
            i === projectIndex
              ? {
                  ...draft,
                  unitTypes: draft.unitTypes.filter((_, j) => j !== unitIndex),
                }
              : draft
          )
        : prev
    )
  }

  function handleCreate() {
    if (!drafts || drafts.length === 0) return
    const missing = findMissingFields(drafts)
    if (missing) {
      toast.error(missing)
      return
    }
    startCreating(async () => {
      try {
        const payload = drafts.map((draft) => ({
          project: toProjectInput(draft),
          unitTypes: toUnitTypeInputs(draft),
        }))
        const created = await createProjectsFromExtraction(payload)
        toast.success(
          `Created ${created.length} project${created.length === 1 ? "" : "s"}`
        )
        router.push(created.length === 1 ? `/projects/${created[0]!.id}` : "/")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create projects"
        )
      }
    })
  }

  if (!drafts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paste project data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            autoFocus
            rows={14}
            placeholder={
              "Paste broker notes, a price list, or a WhatsApp message describing one or more projects…"
            }
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleExtract} disabled={extracting || !text.trim()}>
              <SparklesIcon />
              {extracting ? "Reading…" : "Extract Projects"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {drafts.map((draft, projectIndex) => (
        <Card key={projectIndex}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Project {projectIndex + 1}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeProject(projectIndex)}
            >
              <Trash2Icon />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project Name">
                <Input
                  required
                  value={draft.name}
                  onChange={(event) =>
                    updateProject(projectIndex, { name: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Developer">
                <Input
                  required
                  value={draft.developer}
                  onChange={(event) =>
                    updateProject(projectIndex, { developer: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Community (optional)">
                <Input
                  value={draft.community}
                  onChange={(event) =>
                    updateProject(projectIndex, { community: event.target.value })
                  }
                />
              </FormField>
              <FormField label="City (optional)">
                <Input
                  placeholder="e.g. Dubai, Abu Dhabi"
                  value={draft.city}
                  onChange={(event) =>
                    updateProject(projectIndex, { city: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Location">
                <Input
                  required
                  value={draft.location}
                  onChange={(event) =>
                    updateProject(projectIndex, { location: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={draft.status}
                  onValueChange={(value) =>
                    updateProject(projectIndex, {
                      status: value as ProjectDraft["status"],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatProjectStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Launch Date (optional)">
                <div className="flex gap-2">
                  <Select
                    value={dateToQuarter(draft.launchDate).quarter}
                    onValueChange={(quarter: string | null) => {
                      const year = dateToQuarter(draft.launchDate).year
                      const date = quarterToDate(quarter ?? "", year)
                      updateProject(projectIndex, {
                        launchDate: date
                          ? date.toISOString().slice(0, 10)
                          : "",
                      })
                    }}
                  >
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
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Year"
                    value={dateToQuarter(draft.launchDate).year}
                    onChange={(event) => {
                      const quarter = dateToQuarter(draft.launchDate).quarter
                      const date = quarterToDate(quarter, event.target.value)
                      updateProject(projectIndex, {
                        launchDate: date
                          ? date.toISOString().slice(0, 10)
                          : "",
                      })
                    }}
                  />
                </div>
              </FormField>
              <FormField label="Handover Date (optional)">
                <div className="flex gap-2">
                  <Select
                    value={dateToQuarter(draft.handoverDate).quarter}
                    onValueChange={(quarter: string | null) => {
                      const year = dateToQuarter(draft.handoverDate).year
                      const date = quarterToDate(quarter ?? "", year)
                      updateProject(projectIndex, {
                        handoverDate: date
                          ? date.toISOString().slice(0, 10)
                          : "",
                      })
                    }}
                  >
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
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Year"
                    value={dateToQuarter(draft.handoverDate).year}
                    onChange={(event) => {
                      const quarter = dateToQuarter(draft.handoverDate).quarter
                      const date = quarterToDate(quarter, event.target.value)
                      updateProject(projectIndex, {
                        handoverDate: date
                          ? date.toISOString().slice(0, 10)
                          : "",
                      })
                    }}
                  />
                </div>
              </FormField>
              <FormField label="Payment Plan (optional)">
                <Input
                  placeholder="e.g. 55/45"
                  value={draft.paymentPlan}
                  onChange={(event) =>
                    updateProject(projectIndex, { paymentPlan: event.target.value })
                  }
                />
              </FormField>
              <FormField label="Down Payment % (optional)">
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={draft.downPaymentPercent}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      downPaymentPercent: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Promo Payment Plan (optional)">
                <Input
                  placeholder="e.g. 40/60"
                  value={draft.promoPaymentPlan}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      promoPaymentPlan: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Promo Down Payment % (optional)">
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={draft.promoDownPaymentPercent}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      promoDownPaymentPercent: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Service Charge (AED/sq ft, optional)">
                <Input
                  type="number"
                  step="0.01"
                  value={draft.serviceCharge}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      serviceCharge: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Description (optional)" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) =>
                    updateProject(projectIndex, { description: event.target.value })
                  }
                />
              </FormField>
              <FormField
                label="Promotion Notes (optional)"
                className="sm:col-span-2"
              >
                <Textarea
                  rows={2}
                  placeholder="e.g. 2% ADM Waiver, 5% Broker Commission"
                  value={draft.promotionNotes}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      promotionNotes: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Available Units (optional)">
                <Input
                  type="number"
                  value={draft.availableUnitsCount}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      availableUnitsCount: event.target.value,
                    })
                  }
                />
              </FormField>
              <FormField label="Investment Rating (optional)">
                <Select
                  value={draft.investmentRating}
                  onValueChange={(value) =>
                    updateProject(projectIndex, { investmentRating: value ?? "" })
                  }
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
              </FormField>
              <FormField label="Luxury Rating (optional)">
                <Select
                  value={draft.luxuryRating}
                  onValueChange={(value) =>
                    updateProject(projectIndex, { luxuryRating: value ?? "" })
                  }
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
              </FormField>
              <FormField label="Family Rating (optional)">
                <Select
                  value={draft.familyRating}
                  onValueChange={(value) =>
                    updateProject(projectIndex, { familyRating: value ?? "" })
                  }
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
              </FormField>
              <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch
                    checked={draft.waterfront}
                    onCheckedChange={(checked) =>
                      updateProject(projectIndex, { waterfront: checked })
                    }
                  />
                  Waterfront
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch
                    checked={draft.golf}
                    onCheckedChange={(checked) =>
                      updateProject(projectIndex, { golf: checked })
                    }
                  />
                  Golf
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Switch
                    checked={draft.brandedResidence}
                    onCheckedChange={(checked) =>
                      updateProject(projectIndex, { brandedResidence: checked })
                    }
                  />
                  Branded Residence
                </label>
              </div>
              {draft.brandedResidence ? (
                <FormField label="Brand Name (optional)" className="sm:col-span-2">
                  <Input
                    placeholder="e.g. Armani, Fendi"
                    value={draft.brandName}
                    onChange={(event) =>
                      updateProject(projectIndex, { brandName: event.target.value })
                    }
                  />
                </FormField>
              ) : null}
              <FormField
                label="Amenities (optional, one per line)"
                className="sm:col-span-2"
              >
                <Textarea
                  rows={3}
                  value={draft.amenities}
                  onChange={(event) =>
                    updateProject(projectIndex, { amenities: event.target.value })
                  }
                />
              </FormField>
              <FormField
                label="Selling Points (optional, one per line)"
                className="sm:col-span-2"
              >
                <Textarea
                  rows={3}
                  value={draft.sellingPoints}
                  onChange={(event) =>
                    updateProject(projectIndex, {
                      sellingPoints: event.target.value,
                    })
                  }
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Unit Types</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addUnitType(projectIndex)}
                >
                  Add Unit Type
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {draft.unitTypes.map((unit, unitIndex) => (
                  <div
                    key={unitIndex}
                    className="grid items-end gap-3 rounded-lg border border-border p-3 sm:grid-cols-6"
                  >
                    <FormField label="Property Type" className="sm:col-span-1">
                      <Select
                        value={unit.propertyType}
                        onValueChange={(value) =>
                          updateUnitType(projectIndex, unitIndex, {
                            propertyType: value as UnitTypeDraft["propertyType"],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypeValues.map((propertyType) => (
                            <SelectItem key={propertyType} value={propertyType}>
                              {formatPropertyType(propertyType)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Label" className="sm:col-span-2">
                      <Input
                        value={unit.label}
                        onChange={(event) =>
                          updateUnitType(projectIndex, unitIndex, {
                            label: event.target.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Beds">
                      <Input
                        type="number"
                        value={unit.bedrooms}
                        onChange={(event) =>
                          updateUnitType(projectIndex, unitIndex, {
                            bedrooms: event.target.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Units">
                      <Input
                        type="number"
                        value={unit.unitCount}
                        onChange={(event) =>
                          updateUnitType(projectIndex, unitIndex, {
                            unitCount: event.target.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label={`Price (${DIRHAM_SIGN})`}>
                      <Input
                        type="number"
                        required
                        value={unit.startingPrice}
                        onChange={(event) =>
                          updateUnitType(projectIndex, unitIndex, {
                            startingPrice: event.target.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Service Charge (AED/sq ft)">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Project default"
                        value={unit.serviceCharge}
                        onChange={(event) =>
                          updateUnitType(projectIndex, unitIndex, {
                            serviceCharge: event.target.value,
                          })
                        }
                      />
                    </FormField>
                    <div className="flex items-end justify-end sm:col-span-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeUnitType(projectIndex, unitIndex)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={addProject}>
          Add Another Project
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setDrafts(null)}>
            Start Over
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating
              ? "Creating…"
              : `Create ${drafts.length} Project${drafts.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
