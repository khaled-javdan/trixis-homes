import type {
  InventoryExtractedProject,
  InventoryExtractedUnitType,
} from "@workspace/db/validation/inventory-update"

import type { PlainProject, PlainUnitType } from "@/lib/data/serialize"

// Pure matching + diff helpers for the inventory update flow. Everything here
// works on plain (already-serialized) values so it can run server-side and be
// shipped to the client as-is.

export type InventoryFieldChange = {
  field: string
  label: string
  oldValue: string | number | null
  newValue: string | number | null
}

export type InventoryUnitTypeDiff = {
  unitTypeId: string
  unitTypeLabel: string
  changes: InventoryFieldChange[]
}

export type NewUnitTypeProposal = {
  propertyType: InventoryExtractedUnitType["propertyType"]
  label: string | null
  bedrooms: number | null
  unitCount: number | null
  startingPrice: number | null
  paymentPlan: string | null
  serviceCharge: number | null
  creatable: boolean
}

export type InventoryProjectMatch = {
  extracted: InventoryExtractedProject
  match: {
    projectId: string
    projectName: string
    developer: string
    confidence: "exact" | "fuzzy"
  } | null
  fieldChanges: InventoryFieldChange[]
  unitTypeDiffs: InventoryUnitTypeDiff[]
  newUnitTypes: NewUnitTypeProposal[]
}

export function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split(" ").filter(Boolean))
  const tokensB = new Set(b.split(" ").filter(Boolean))
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  let shared = 0
  for (const token of tokensA) if (tokensB.has(token)) shared += 1
  return (2 * shared) / (tokensA.size + tokensB.size)
}

export type ProjectMatchCandidate = {
  id: string
  name: string
  developer: string
}

export function matchProject(
  extracted: InventoryExtractedProject,
  candidates: ProjectMatchCandidate[]
): { id: string; confidence: "exact" | "fuzzy" } | null {
  if (!extracted.name) return null
  const name = normalizeName(extracted.name)
  if (!name) return null
  const developer = extracted.developer
    ? normalizeName(extracted.developer)
    : null

  const preferByDeveloper = (pool: ProjectMatchCandidate[]) => {
    if (pool.length <= 1 || !developer) return pool[0] ?? null
    return (
      pool.find((candidate) =>
        normalizeName(candidate.developer).includes(developer)
      ) ?? pool[0] ?? null
    )
  }

  const exact = candidates.filter(
    (candidate) => normalizeName(candidate.name) === name
  )
  const exactPick = preferByDeveloper(exact)
  if (exactPick) return { id: exactPick.id, confidence: "exact" }

  if (name.length >= 4) {
    const contains = candidates.filter((candidate) => {
      const candidateName = normalizeName(candidate.name)
      return (
        candidateName.length >= 4 &&
        (candidateName.includes(name) || name.includes(candidateName))
      )
    })
    const containsPick = preferByDeveloper(contains)
    if (containsPick) return { id: containsPick.id, confidence: "fuzzy" }
  }

  let best: { candidate: ProjectMatchCandidate; score: number } | null = null
  for (const candidate of candidates) {
    const score = tokenSimilarity(name, normalizeName(candidate.name))
    if (score >= 0.6 && (!best || score > best.score)) {
      best = { candidate, score }
    }
  }
  if (best) return { id: best.candidate.id, confidence: "fuzzy" }
  return null
}

export function matchUnitType(
  extracted: InventoryExtractedUnitType,
  dbUnits: PlainUnitType[],
  taken: Set<string>
): PlainUnitType | null {
  const available = dbUnits.filter((unit) => !taken.has(unit.id))
  const sameType = available.filter(
    (unit) => unit.propertyType === extracted.propertyType
  )
  if (sameType.length === 0) return null

  const label = extracted.label ? normalizeName(extracted.label) : null
  const byLabel = (pool: PlainUnitType[]) => {
    if (pool.length <= 1 || !label) return pool[0] ?? null
    let best: { unit: PlainUnitType; score: number } | null = null
    for (const unit of pool) {
      const unitLabel = unit.label ? normalizeName(unit.label) : ""
      const score =
        unitLabel && (unitLabel.includes(label) || label.includes(unitLabel))
          ? 1
          : tokenSimilarity(label, unitLabel)
      if (!best || score > best.score) best = { unit, score }
    }
    return best?.unit ?? null
  }

  if (extracted.bedrooms != null) {
    const sameBedrooms = sameType.filter(
      (unit) => unit.bedrooms === extracted.bedrooms
    )
    return byLabel(sameBedrooms)
  }
  return byLabel(sameType)
}

type FieldKind = "number" | "string" | "enum" | "date"

const PROJECT_FIELD_MANIFEST: {
  field: keyof InventoryExtractedProject & keyof PlainProject
  label: string
  kind: FieldKind
}[] = [
  { field: "availableUnitsCount", label: "Available Units", kind: "number" },
  { field: "paymentPlan", label: "Payment Plan", kind: "string" },
  { field: "downPaymentPercent", label: "Down Payment %", kind: "number" },
  { field: "promoPaymentPlan", label: "Promo Payment Plan", kind: "string" },
  {
    field: "promoDownPaymentPercent",
    label: "Promo Down Payment %",
    kind: "number",
  },
  { field: "promotionNotes", label: "Promotion Notes", kind: "string" },
  { field: "serviceCharge", label: "Service Charge", kind: "number" },
  { field: "status", label: "Status", kind: "enum" },
  { field: "handoverDate", label: "Handover Date", kind: "date" },
]

const UNIT_FIELD_MANIFEST: {
  field: keyof InventoryExtractedUnitType & keyof PlainUnitType
  label: string
  kind: FieldKind
}[] = [
  { field: "unitCount", label: "Units", kind: "number" },
  { field: "startingPrice", label: "Starting Price", kind: "number" },
  { field: "paymentPlan", label: "Payment Plan", kind: "string" },
  { field: "serviceCharge", label: "Service Charge", kind: "number" },
]

function normalizeString(value: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim().replace(/\s+/g, " ")
  return trimmed === "" ? null : trimmed
}

function isEqual(
  kind: FieldKind,
  oldValue: string | number | null,
  newValue: string | number | null
): boolean {
  if (oldValue == null && newValue == null) return true
  if (oldValue == null || newValue == null) return false
  switch (kind) {
    case "number":
      return (
        Math.round(Number(oldValue) * 100) === Math.round(Number(newValue) * 100)
      )
    case "string":
      return (
        String(oldValue).trim().replace(/\s+/g, " ").toLowerCase() ===
        String(newValue).trim().replace(/\s+/g, " ").toLowerCase()
      )
    case "enum":
      return oldValue === newValue
    case "date":
      return String(oldValue).slice(0, 10) === String(newValue).slice(0, 10)
  }
}

function collectChanges<T extends string>(
  manifest: { field: T; label: string; kind: FieldKind }[],
  extracted: Record<T, unknown>,
  current: Record<T, unknown>
): InventoryFieldChange[] {
  const changes: InventoryFieldChange[] = []
  for (const { field, label, kind } of manifest) {
    const rawNew = extracted[field]
    // null from extraction means "not mentioned" — never propose a change
    if (rawNew == null) continue
    const newValue =
      kind === "string"
        ? normalizeString(rawNew as string)
        : (rawNew as string | number)
    if (newValue == null) continue
    const oldValue = (current[field] ?? null) as string | number | null
    if (isEqual(kind, oldValue, newValue)) continue
    changes.push({
      field,
      label,
      oldValue: kind === "date" && oldValue ? String(oldValue).slice(0, 10) : oldValue,
      newValue,
    })
  }
  return changes
}

export function formatUnitTypeName(unit: PlainUnitType): string {
  if (unit.label) return unit.label
  const bedrooms =
    unit.bedrooms == null
      ? ""
      : unit.bedrooms === 0
        ? "Studio "
        : `${unit.bedrooms}BR `
  const type =
    unit.propertyType.charAt(0) + unit.propertyType.slice(1).toLowerCase()
  return `${bedrooms}${type}`.trim()
}

export function buildProjectDiff(
  extracted: InventoryExtractedProject,
  project: PlainProject
): Pick<
  InventoryProjectMatch,
  "fieldChanges" | "unitTypeDiffs" | "newUnitTypes"
> {
  const fieldChanges = collectChanges(
    PROJECT_FIELD_MANIFEST,
    extracted,
    project
  )

  const unitTypeDiffs: InventoryUnitTypeDiff[] = []
  const newUnitTypes: NewUnitTypeProposal[] = []
  const taken = new Set<string>()

  for (const extractedUnit of extracted.unitTypes) {
    const matched = matchUnitType(extractedUnit, project.unitTypes, taken)
    if (matched) {
      taken.add(matched.id)
      const changes = collectChanges(
        UNIT_FIELD_MANIFEST,
        extractedUnit,
        matched
      )
      if (changes.length > 0) {
        unitTypeDiffs.push({
          unitTypeId: matched.id,
          unitTypeLabel: formatUnitTypeName(matched),
          changes,
        })
      }
    } else {
      newUnitTypes.push({
        propertyType: extractedUnit.propertyType,
        label: normalizeString(extractedUnit.label),
        bedrooms: extractedUnit.bedrooms,
        unitCount: extractedUnit.unitCount,
        startingPrice: extractedUnit.startingPrice,
        paymentPlan: normalizeString(extractedUnit.paymentPlan),
        serviceCharge: extractedUnit.serviceCharge,
        creatable:
          extractedUnit.startingPrice != null && extractedUnit.startingPrice > 0,
      })
    }
  }

  return { fieldChanges, unitTypeDiffs, newUnitTypes }
}
