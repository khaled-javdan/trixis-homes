import type {
  Attachment,
  Note,
  PaymentMilestone,
  Project,
  UnitType,
} from "@workspace/db"

export type PlainUnitType = {
  id: string
  propertyType: UnitType["propertyType"]
  label: string | null
  unitCount: number | null
  startingPrice: number
  size: number | null
  plotSize: number | null
  bua: number | null
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  paymentPlan: string | null
  serviceCharge: number | null
  notes: string | null
  listingUrl: string | null
  createdAt: string
  updatedAt: string
}

export type PlainPaymentMilestone = {
  id: string
  label: string
  percentage: number
  date: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export type PlainNote = {
  id: string
  body: string
  createdAt: string
  updatedAt: string
}

export function getCoverImageUrl(
  attachments: {
    category: Attachment["category"]
    url: string
    uploadedAt: string
    isCover: boolean
  }[]
): string | null {
  const images = attachments.filter((attachment) => attachment.category === "IMAGE")
  if (images.length === 0) return null
  const explicitCover = images.find((image) => image.isCover)
  if (explicitCover) return explicitCover.url
  return [...images].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt))[0]!.url
}

export type PlainAttachment = {
  id: string
  filename: string
  url: string
  pathname: string
  contentType: string
  size: number
  category: Attachment["category"]
  isCover: boolean
  uploadedAt: string
}

export type PlainProject = {
  id: string
  name: string
  developer: string
  masterCommunity: string | null
  community: string | null
  city: string | null
  location: string
  latitude: number | null
  longitude: number | null
  status: Project["status"]
  launchDate: string | null
  handoverDate: string | null
  description: string | null
  paymentPlan: string | null
  downPaymentPercent: number | null
  promoPaymentPlan: string | null
  promoDownPaymentPercent: number | null
  promotionNotes: string | null
  serviceCharge: number | null
  amenities: string[]
  sellingPoints: string[]
  investmentRating: number | null
  luxuryRating: number | null
  familyRating: number | null
  waterfront: boolean
  golf: boolean
  brandedResidence: boolean
  brandName: string | null
  availableUnitsCount: number | null
  link: string | null
  isFavorite: boolean
  isPublished: boolean
  slug: string | null
  inventoryUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  unitTypes: PlainUnitType[]
  notes: PlainNote[]
  attachments: PlainAttachment[]
  paymentMilestones: PlainPaymentMilestone[]
}

type Decimalish = { toNumber(): number }

function decimalToNumber(value: Decimalish | null): number | null {
  return value == null ? null : value.toNumber()
}

export function toPlainUnitType(unit: UnitType): PlainUnitType {
  return {
    id: unit.id,
    propertyType: unit.propertyType,
    label: unit.label,
    unitCount: unit.unitCount,
    startingPrice: (unit.startingPrice as unknown as Decimalish).toNumber(),
    size: decimalToNumber(unit.size as unknown as Decimalish | null),
    plotSize: decimalToNumber(unit.plotSize as unknown as Decimalish | null),
    bua: decimalToNumber(unit.bua as unknown as Decimalish | null),
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    parking: unit.parking,
    paymentPlan: unit.paymentPlan,
    serviceCharge: decimalToNumber(unit.serviceCharge as unknown as Decimalish | null),
    notes: unit.notes,
    listingUrl: unit.listingUrl,
    createdAt: unit.createdAt.toISOString(),
    updatedAt: unit.updatedAt.toISOString(),
  }
}

export function toPlainPaymentMilestone(
  milestone: PaymentMilestone
): PlainPaymentMilestone {
  return {
    id: milestone.id,
    label: milestone.label,
    percentage: (milestone.percentage as unknown as Decimalish).toNumber(),
    date: milestone.date.toISOString(),
    note: milestone.note,
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  }
}

export function toPlainNote(note: Note): PlainNote {
  return {
    id: note.id,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

export function toPlainAttachment(attachment: Attachment): PlainAttachment {
  return {
    id: attachment.id,
    filename: attachment.filename,
    url: attachment.url,
    pathname: attachment.pathname,
    contentType: attachment.contentType,
    size: attachment.size,
    category: attachment.category,
    isCover: attachment.isCover,
    uploadedAt: attachment.uploadedAt.toISOString(),
  }
}

export function toPlainProject(
  project: Project & {
    unitTypes?: UnitType[]
    notes?: Note[]
    attachments?: Attachment[]
    paymentMilestones?: PaymentMilestone[]
  }
): PlainProject {
  return {
    id: project.id,
    name: project.name,
    developer: project.developer,
    masterCommunity: project.masterCommunity,
    community: project.community,
    city: project.city,
    location: project.location,
    latitude: project.latitude,
    longitude: project.longitude,
    status: project.status,
    launchDate: project.launchDate ? project.launchDate.toISOString() : null,
    handoverDate: project.handoverDate
      ? project.handoverDate.toISOString()
      : null,
    description: project.description,
    paymentPlan: project.paymentPlan,
    downPaymentPercent: decimalToNumber(
      project.downPaymentPercent as unknown as Decimalish | null
    ),
    promoPaymentPlan: project.promoPaymentPlan,
    promoDownPaymentPercent: decimalToNumber(
      project.promoDownPaymentPercent as unknown as Decimalish | null
    ),
    promotionNotes: project.promotionNotes,
    serviceCharge: decimalToNumber(
      project.serviceCharge as unknown as Decimalish | null
    ),
    amenities: project.amenities,
    sellingPoints: project.sellingPoints,
    investmentRating: project.investmentRating,
    luxuryRating: project.luxuryRating,
    familyRating: project.familyRating,
    waterfront: project.waterfront,
    golf: project.golf,
    brandedResidence: project.brandedResidence,
    brandName: project.brandName,
    availableUnitsCount: project.availableUnitsCount,
    link: project.link,
    isFavorite: project.isFavorite,
    isPublished: project.isPublished,
    slug: project.slug,
    inventoryUpdatedAt: project.inventoryUpdatedAt
      ? project.inventoryUpdatedAt.toISOString()
      : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    unitTypes: (project.unitTypes ?? []).map(toPlainUnitType),
    notes: (project.notes ?? []).map(toPlainNote),
    attachments: (project.attachments ?? []).map(toPlainAttachment),
    paymentMilestones: (project.paymentMilestones ?? []).map(
      toPlainPaymentMilestone
    ),
  }
}
