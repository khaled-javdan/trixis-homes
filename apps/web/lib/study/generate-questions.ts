import {
  formatArea,
  formatDate,
  formatPrice,
  formatProjectStatus,
  formatUnitCategory,
} from "@/lib/format"
import { getCoverImageUrl, type PlainProject } from "@/lib/data/serialize"

export type QAPair = {
  id: string
  category: string
  prompt: string
  answer: string
  project: {
    name: string
    location: string
    status: string
    coverImageUrl: string | null
  }
}

type QAPairDraft = Omit<QAPair, "project">

type QuestionTemplate = {
  id: string
  appliesTo: (project: PlainProject) => boolean
  generate: (project: PlainProject) => QAPairDraft[]
}

function unitLabel(unit: PlainProject["unitTypes"][number]) {
  return unit.label?.trim() || formatUnitCategory(unit.category)
}

const questionTemplates: QuestionTemplate[] = [
  {
    id: "project-location",
    appliesTo: () => true,
    generate: (project) => [
      {
        id: `${project.id}:location`,
        category: "Location",
        prompt: `Where is ${project.name} located?`,
        answer: project.community
          ? `${project.location} (${project.community})`
          : project.location,
      },
    ],
  },
  {
    id: "project-developer",
    appliesTo: () => true,
    generate: (project) => [
      {
        id: `${project.id}:developer`,
        category: "Developer",
        prompt: `Who is developing ${project.name}?`,
        answer: project.developer,
      },
    ],
  },
  {
    id: "project-status",
    appliesTo: () => true,
    generate: (project) => [
      {
        id: `${project.id}:status`,
        category: "Status",
        prompt: `What is the current status of ${project.name}?`,
        answer: formatProjectStatus(project.status),
      },
    ],
  },
  {
    id: "project-handover",
    appliesTo: (project) => project.handoverDate != null,
    generate: (project) => [
      {
        id: `${project.id}:handover`,
        category: "Handover",
        prompt: `When is the handover date for ${project.name}?`,
        answer: formatDate(project.handoverDate)!,
      },
    ],
  },
  {
    id: "project-payment-plan",
    appliesTo: (project) => Boolean(project.paymentPlan),
    generate: (project) => [
      {
        id: `${project.id}:payment-plan`,
        category: "Payment Plan",
        prompt: `What is the payment plan for ${project.name}?`,
        answer: project.paymentPlan!,
      },
    ],
  },
  {
    id: "project-unit-count",
    appliesTo: (project) => project.unitTypes.length > 0,
    generate: (project) => [
      {
        id: `${project.id}:unit-count`,
        category: "Unit Types",
        prompt: `How many unit types does ${project.name} offer?`,
        answer: `${project.unitTypes.length}`,
      },
    ],
  },
  {
    id: "project-overall-starting-price",
    appliesTo: (project) => project.unitTypes.length > 0,
    generate: (project) => {
      const min = Math.min(
        ...project.unitTypes.map((unit) => unit.startingPrice)
      )
      return [
        {
          id: `${project.id}:overall-starting-price`,
          category: "Starting Price",
          prompt: `What is the starting price at ${project.name}?`,
          answer: `Starting from ${formatPrice(min)}`,
        },
      ]
    },
  },
  {
    id: "unit-starting-price",
    appliesTo: (project) => project.unitTypes.length > 0,
    generate: (project) =>
      project.unitTypes.map((unit) => ({
        id: `${unit.id}:starting-price`,
        category: "Unit Starting Price",
        prompt: `What is the starting price of the ${unitLabel(unit)} in ${project.name}?`,
        answer: `Starting from ${formatPrice(unit.startingPrice)}`,
      })),
  },
  {
    id: "unit-size",
    appliesTo: (project) => project.unitTypes.some((unit) => unit.size != null),
    generate: (project) =>
      project.unitTypes
        .filter((unit) => unit.size != null)
        .map((unit) => ({
          id: `${unit.id}:size`,
          category: "Unit Size",
          prompt: `What is the size of the ${unitLabel(unit)} in ${project.name}?`,
          answer: formatArea(unit.size)!,
        })),
  },
  {
    id: "unit-bedrooms-bathrooms",
    appliesTo: (project) =>
      project.unitTypes.some(
        (unit) => unit.bedrooms != null || unit.bathrooms != null
      ),
    generate: (project) =>
      project.unitTypes
        .filter((unit) => unit.bedrooms != null || unit.bathrooms != null)
        .map((unit) => ({
          id: `${unit.id}:bed-bath`,
          category: "Bedrooms / Bathrooms",
          prompt: `How many bedrooms and bathrooms does the ${unitLabel(unit)} in ${project.name} have?`,
          answer: `${unit.bedrooms ?? "-"} bed / ${unit.bathrooms ?? "-"} bath`,
        })),
  },
  {
    id: "unit-payment-plan-override",
    appliesTo: (project) =>
      project.unitTypes.some((unit) => Boolean(unit.paymentPlan)),
    generate: (project) =>
      project.unitTypes
        .filter((unit) => unit.paymentPlan)
        .map((unit) => ({
          id: `${unit.id}:payment-plan`,
          category: "Payment Plan",
          prompt: `What is the payment plan for the ${unitLabel(unit)} in ${project.name}?`,
          answer: unit.paymentPlan!,
        })),
  },
]

export function generateQuestionsForProject(project: PlainProject): QAPair[] {
  const snapshot = {
    name: project.name,
    location: project.community
      ? `${project.location} (${project.community})`
      : project.location,
    status: formatProjectStatus(project.status),
    coverImageUrl: getCoverImageUrl(project.attachments),
  }

  return questionTemplates
    .filter((template) => template.appliesTo(project))
    .flatMap((template) => template.generate(project))
    .map((pair) => ({ ...pair, project: snapshot }))
}

export function generateQuestionsForProjects(
  projects: PlainProject[]
): QAPair[] {
  return projects.flatMap(generateQuestionsForProject)
}
