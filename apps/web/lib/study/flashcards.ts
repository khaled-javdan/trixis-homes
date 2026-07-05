import {
  formatDate,
  formatPriceWithSymbol,
  formatProjectStatus,
  formatUnitTypeName,
} from "@/lib/format"
import { getCoverImageUrl, type PlainProject } from "@/lib/data/serialize"

export type Flashcard = {
  id: string
  front: string
  coverImageUrl: string | null
  back: {
    developer: string
    location: string
    status: string
    unitTypesSummary: string[]
    startingPrice: string | null
    paymentPlan: string | null
    handoverDate: string | null
    notesExcerpt: string | null
  }
}

export function generateFlashcardForProject(project: PlainProject): Flashcard {
  const prices = project.unitTypes.map((unit) => unit.startingPrice)
  const startingPrice = prices.length
    ? formatPriceWithSymbol(Math.min(...prices))
    : null

  return {
    id: project.id,
    front: project.name,
    coverImageUrl: getCoverImageUrl(project.attachments),
    back: {
      developer: project.developer,
      location: project.community
        ? `${project.location} (${project.community})`
        : project.location,
      status: formatProjectStatus(project.status),
      unitTypesSummary: project.unitTypes.map(
        (unit) =>
          `${unit.label?.trim() || formatUnitTypeName(unit.propertyType, unit.bedrooms)} — ${formatPriceWithSymbol(unit.startingPrice)}`
      ),
      startingPrice,
      paymentPlan: project.paymentPlan,
      handoverDate: formatDate(project.handoverDate),
      notesExcerpt: project.notes[0]?.body ?? null,
    },
  }
}

export function generateFlashcardsForProjects(
  projects: PlainProject[]
): Flashcard[] {
  return projects.map(generateFlashcardForProject)
}
