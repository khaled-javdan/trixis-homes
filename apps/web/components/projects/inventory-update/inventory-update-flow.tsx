"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SparklesIcon, UploadCloudIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  applyInventoryUpdates,
  extractInventoryUpdate,
  rematchInventoryProject,
  type ApplyInventoryProjectInput,
} from "@/lib/actions/inventory-update"
import type { ProjectMatchOption } from "@/lib/data/projects"
import { formatPrice, formatProjectStatus, formatPropertyType } from "@/lib/format"
import type {
  InventoryFieldChange,
  InventoryProjectMatch,
  NewUnitTypeProposal,
} from "@/lib/inventory-diff"
import type {
  InventoryProjectPatch,
  InventoryUnitTypePatch,
} from "@workspace/db/validation/inventory-update"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const SKIP_VALUE = "__skip__"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

type ReviewProject = InventoryProjectMatch & {
  skipped: boolean
  acceptedFields: Record<string, boolean>
  acceptedUnitFields: Record<string, boolean>
  acceptedNewUnits: boolean[]
}

function toReviewProject(match: InventoryProjectMatch): ReviewProject {
  return {
    ...match,
    skipped: false,
    acceptedFields: Object.fromEntries(
      match.fieldChanges.map((change) => [change.field, true])
    ),
    acceptedUnitFields: Object.fromEntries(
      match.unitTypeDiffs.flatMap((unit) =>
        unit.changes.map((change) => [`${unit.unitTypeId}:${change.field}`, true])
      )
    ),
    acceptedNewUnits: match.newUnitTypes.map((unit) => unit.creatable),
  }
}

function formatValue(
  field: string,
  value: string | number | null
): string {
  if (value == null) return "—"
  if (field === "startingPrice") return formatPrice(Number(value)) ?? "—"
  if (field === "status") return formatProjectStatus(String(value) as never)
  return String(value)
}

function describeNewUnit(unit: NewUnitTypeProposal): string {
  const bedrooms =
    unit.bedrooms == null
      ? null
      : unit.bedrooms === 0
        ? "Studio"
        : `${unit.bedrooms}BR`
  return (
    unit.label ??
    [bedrooms, formatPropertyType(unit.propertyType)].filter(Boolean).join(" ")
  )
}

function newUnitSummary(unit: NewUnitTypeProposal): string {
  const parts: string[] = []
  if (unit.unitCount != null) parts.push(`${unit.unitCount} units`)
  if (unit.startingPrice != null)
    parts.push(`from ${formatPrice(unit.startingPrice)}`)
  if (unit.paymentPlan) parts.push(unit.paymentPlan)
  return parts.join(" · ") || "—"
}

function countAcceptedChanges(result: ReviewProject): number {
  if (result.skipped || !result.match) return 0
  return (
    Object.values(result.acceptedFields).filter(Boolean).length +
    Object.values(result.acceptedUnitFields).filter(Boolean).length +
    result.acceptedNewUnits.filter(Boolean).length
  )
}

export function InventoryUpdateFlow({
  projectOptions,
}: {
  projectOptions: ProjectMatchOption[]
}) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"paste" | "upload">("paste")
  const [text, setText] = React.useState("")
  const [imageDataUrl, setImageDataUrl] = React.useState<string | null>(null)
  const [imageName, setImageName] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<ReviewProject[] | null>(null)
  const [extracting, startExtracting] = React.useTransition()
  const [rematching, startRematching] = React.useTransition()
  const [applying, startApplying] = React.useTransition()
  const inputRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setMode("paste")
    setText("")
    setImageDataUrl(null)
    setImageName(null)
    setResults(null)
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is too large (max 8MB)")
      return
    }
    setImageDataUrl(await readFileAsDataUrl(file))
    setImageName(file.name)
  }

  function handleExtract() {
    if (!text.trim() && !imageDataUrl) return
    startExtracting(async () => {
      try {
        const extracted = await extractInventoryUpdate({
          text: text.trim() || undefined,
          imageDataUrl: imageDataUrl ?? undefined,
        })
        if (extracted.length === 0) {
          toast.error("Couldn't find an availability update in that input")
          return
        }
        setResults(extracted.map(toReviewProject))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to extract"
        )
      }
    })
  }

  function updateResult(index: number, patch: Partial<ReviewProject>) {
    setResults((prev) =>
      prev
        ? prev.map((result, i) =>
            i === index ? { ...result, ...patch } : result
          )
        : prev
    )
  }

  function handleMatchChange(index: number, value: string | null) {
    if (!results || !value) return
    if (value === SKIP_VALUE) {
      updateResult(index, { skipped: true })
      return
    }
    const current = results[index]!
    if (current.match?.projectId === value) {
      if (current.skipped) updateResult(index, { skipped: false })
      return
    }
    startRematching(async () => {
      try {
        const rematched = await rematchInventoryProject(
          current.extracted,
          value
        )
        setResults((prev) =>
          prev
            ? prev.map((result, i) =>
                i === index ? toReviewProject(rematched) : result
              )
            : prev
        )
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load project"
        )
      }
    })
  }

  function buildApplyPayload(): ApplyInventoryProjectInput[] {
    if (!results) return []
    const payload: ApplyInventoryProjectInput[] = []
    for (const result of results) {
      if (result.skipped || !result.match) continue

      const projectPatch: Record<string, unknown> = {}
      for (const change of result.fieldChanges) {
        if (result.acceptedFields[change.field]) {
          projectPatch[change.field] = change.newValue
        }
      }

      const patchesByUnit = new Map<string, Record<string, unknown>>()
      for (const unit of result.unitTypeDiffs) {
        for (const change of unit.changes) {
          if (!result.acceptedUnitFields[`${unit.unitTypeId}:${change.field}`])
            continue
          const patch = patchesByUnit.get(unit.unitTypeId) ?? {}
          patch[change.field] = change.newValue
          patchesByUnit.set(unit.unitTypeId, patch)
        }
      }

      const newUnitTypes: ApplyInventoryProjectInput["newUnitTypes"] = []
      result.newUnitTypes.forEach((unit, unitIndex) => {
        if (!result.acceptedNewUnits[unitIndex] || !unit.creatable) return
        newUnitTypes.push({
          propertyType: unit.propertyType,
          label: unit.label ?? "",
          bedrooms: unit.bedrooms,
          unitCount: unit.unitCount,
          startingPrice: unit.startingPrice!,
          paymentPlan: unit.paymentPlan ?? "",
          serviceCharge: unit.serviceCharge,
          notes: "",
          listingUrl: "",
        })
      })

      payload.push({
        projectId: result.match.projectId,
        projectPatch: projectPatch as InventoryProjectPatch,
        unitTypePatches: Array.from(patchesByUnit.entries()).map(
          ([unitTypeId, patch]) => ({
            unitTypeId,
            patch: patch as InventoryUnitTypePatch,
          })
        ),
        newUnitTypes,
      })
    }
    return payload
  }

  function handleApply() {
    const payload = buildApplyPayload()
    if (payload.length === 0) {
      toast.error("Nothing to apply — every project is skipped or unmatched")
      return
    }
    startApplying(async () => {
      try {
        const { updatedProjects, createdUnitTypes } =
          await applyInventoryUpdates(payload)
        toast.success(
          `Updated ${updatedProjects} project${updatedProjects === 1 ? "" : "s"}` +
            (createdUnitTypes > 0
              ? ` and added ${createdUnitTypes} unit type${createdUnitTypes === 1 ? "" : "s"}`
              : "")
        )
        router.push("/")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to apply updates"
        )
      }
    })
  }

  if (results === null) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "paste" | "upload")}
          >
            <TabsList>
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="pt-3">
              <Textarea
                autoFocus
                rows={12}
                placeholder={
                  "Paste a developer availability sheet, e.g.\n\nOcean Crest by Meraas — availability update\n1BR — 12 units left | from 1.45m\n2BR — SOLD OUT\nNew PP 55/45, 10% DP\nHandover Q4 2027"
                }
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-3">
              <div
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                  "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
                )}
              >
                <UploadCloudIcon className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {imageName ?? "Click to upload an availability sheet screenshot"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or WEBP — up to 8MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
              </div>
              {imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- transient preview of a client-side data URL, not a served asset
                <img
                  src={imageDataUrl}
                  alt="Availability sheet preview"
                  className="mt-3 max-h-48 w-full rounded-lg border border-border object-contain"
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              onClick={handleExtract}
              disabled={extracting || (!text.trim() && !imageDataUrl)}
            >
              <SparklesIcon />
              {extracting ? "Reading…" : "Extract Updates"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalChanges = results.reduce(
    (sum, result) => sum + countAcceptedChanges(result),
    0
  )
  const applicableProjects = results.filter(
    (result) => !result.skipped && result.match
  ).length

  return (
    <div className="flex flex-col gap-4">
      {results.map((result, index) => {
        const hasChanges =
          result.fieldChanges.length > 0 ||
          result.unitTypeDiffs.length > 0 ||
          result.newUnitTypes.length > 0
        return (
          <Card key={index} className={cn(result.skipped && "opacity-60")}>
            <CardHeader className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  {result.extracted.name ?? "Unnamed project"}
                </CardTitle>
                {result.extracted.developer && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {result.extracted.developer}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {result.match?.confidence === "fuzzy" && !result.skipped && (
                  <Badge className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    Check match
                  </Badge>
                )}
                <Select
                  value={
                    result.skipped
                      ? SKIP_VALUE
                      : (result.match?.projectId ?? null)
                  }
                  onValueChange={(value) =>
                    handleMatchChange(index, value as string | null)
                  }
                  disabled={rematching}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Assign a project…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SKIP_VALUE}>
                      Skip — don&apos;t update
                    </SelectItem>
                    {projectOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name} — {option.developer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {result.skipped ? (
                <p className="text-sm text-muted-foreground">
                  This entry will be skipped.
                </p>
              ) : !result.match ? (
                <p className="text-sm text-muted-foreground">
                  No matching project found. Assign one above, or create it
                  first via{" "}
                  <Link
                    href="/projects/ai-import"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Paste to Create
                  </Link>
                  .
                </p>
              ) : !hasChanges ? (
                <p className="text-sm text-muted-foreground">
                  No changes detected — applying will just mark{" "}
                  <span className="font-medium text-foreground">
                    {result.match.projectName}
                  </span>{" "}
                  as verified.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Apply</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>New</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.fieldChanges.map((change) => (
                        <DiffRow
                          key={change.field}
                          change={change}
                          checked={result.acceptedFields[change.field] ?? false}
                          onCheckedChange={(checked) =>
                            updateResult(index, {
                              acceptedFields: {
                                ...result.acceptedFields,
                                [change.field]: checked,
                              },
                            })
                          }
                        />
                      ))}
                      {result.unitTypeDiffs.map((unit) => (
                        <React.Fragment key={unit.unitTypeId}>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableCell
                              colSpan={4}
                              className="py-1.5 text-xs font-medium text-muted-foreground"
                            >
                              {unit.unitTypeLabel}
                            </TableCell>
                          </TableRow>
                          {unit.changes.map((change) => {
                            const key = `${unit.unitTypeId}:${change.field}`
                            return (
                              <DiffRow
                                key={key}
                                change={change}
                                checked={
                                  result.acceptedUnitFields[key] ?? false
                                }
                                onCheckedChange={(checked) =>
                                  updateResult(index, {
                                    acceptedUnitFields: {
                                      ...result.acceptedUnitFields,
                                      [key]: checked,
                                    },
                                  })
                                }
                              />
                            )
                          })}
                        </React.Fragment>
                      ))}
                      {result.newUnitTypes.length > 0 && (
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableCell
                            colSpan={4}
                            className="py-1.5 text-xs font-medium text-muted-foreground"
                          >
                            New unit types
                          </TableCell>
                        </TableRow>
                      )}
                      {result.newUnitTypes.map((unit, unitIndex) => (
                        <TableRow key={`new-${unitIndex}`}>
                          <TableCell>
                            <Checkbox
                              checked={
                                result.acceptedNewUnits[unitIndex] ?? false
                              }
                              disabled={!unit.creatable}
                              onCheckedChange={(checked) =>
                                updateResult(index, {
                                  acceptedNewUnits:
                                    result.acceptedNewUnits.map(
                                      (accepted, i) =>
                                        i === unitIndex
                                          ? Boolean(checked)
                                          : accepted
                                    ),
                                })
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {describeNewUnit(unit)}
                            {!unit.creatable && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                missing price — can&apos;t create
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            —
                          </TableCell>
                          <TableCell className="font-medium">
                            {newUnitSummary(unit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {totalChanges} change{totalChanges === 1 ? "" : "s"} across{" "}
          {applicableProjects} project{applicableProjects === 1 ? "" : "s"}
          {applicableProjects > 0 &&
            " — applied projects are marked as verified"}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={reset}>
            Start Over
          </Button>
          <Button
            onClick={handleApply}
            disabled={applying || rematching || applicableProjects === 0}
          >
            {applying ? "Applying…" : "Apply Updates"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DiffRow({
  change,
  checked,
  onCheckedChange,
}: {
  change: InventoryFieldChange
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        />
      </TableCell>
      <TableCell className="font-medium">{change.label}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatValue(change.field, change.oldValue)}
      </TableCell>
      <TableCell className="font-medium">
        {formatValue(change.field, change.newValue)}
      </TableCell>
    </TableRow>
  )
}
