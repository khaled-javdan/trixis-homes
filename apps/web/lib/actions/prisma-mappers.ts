import {
  paymentMilestoneSchema,
  type PaymentMilestoneInput,
} from "@workspace/db/validation/payment-milestone"
import { projectSchema, type ProjectInput } from "@workspace/db/validation/project"
import {
  unitTypeSchema,
  type UnitTypeInput,
} from "@workspace/db/validation/unit-type"

import { geocodeLocation } from "@/lib/geocode"

export async function toProjectData(input: ProjectInput) {
  const parsed = projectSchema.parse(input)
  const coordinates = await geocodeLocation(
    [parsed.location, parsed.community, "United Arab Emirates"]
      .filter(Boolean)
      .join(", ")
  )
  return {
    name: parsed.name,
    developer: parsed.developer,
    community: parsed.community || null,
    city: parsed.city || null,
    location: parsed.location,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    status: parsed.status,
    handoverDate: parsed.handoverDate ?? null,
    description: parsed.description || null,
    paymentPlan: parsed.paymentPlan || null,
    downPaymentPercent: parsed.downPaymentPercent ?? null,
    promoPaymentPlan: parsed.promoPaymentPlan || null,
    promoDownPaymentPercent: parsed.promoDownPaymentPercent ?? null,
    promotionNotes: parsed.promotionNotes || null,
    serviceCharge: parsed.serviceCharge ?? null,
    amenities: parsed.amenities ?? [],
    sellingPoints: parsed.sellingPoints ?? [],
    investmentRating: parsed.investmentRating ?? null,
    luxuryRating: parsed.luxuryRating ?? null,
    familyRating: parsed.familyRating ?? null,
    waterfront: parsed.waterfront ?? false,
    golf: parsed.golf ?? false,
    brandedResidence: parsed.brandedResidence ?? false,
    brandName: parsed.brandName || null,
    availableUnitsCount: parsed.availableUnitsCount ?? null,
    link: parsed.link || null,
  }
}

export function toUnitTypeData(input: UnitTypeInput) {
  const parsed = unitTypeSchema.parse(input)
  return {
    propertyType: parsed.propertyType,
    label: parsed.label || null,
    unitCount: parsed.unitCount ?? null,
    startingPrice: parsed.startingPrice,
    size: parsed.size ?? null,
    plotSize: parsed.plotSize ?? null,
    bua: parsed.bua ?? null,
    bedrooms: parsed.bedrooms ?? null,
    bathrooms: parsed.bathrooms ?? null,
    parking: parsed.parking ?? null,
    paymentPlan: parsed.paymentPlan || null,
    serviceCharge: parsed.serviceCharge ?? null,
    notes: parsed.notes || null,
  }
}

export function toPaymentMilestoneData(input: PaymentMilestoneInput) {
  const parsed = paymentMilestoneSchema.parse(input)
  return {
    label: parsed.label,
    percentage: parsed.percentage,
    timing: parsed.timing,
    offsetMonths: parsed.timing === "AFTER_HANDOVER" ? parsed.offsetMonths : null,
    fixedDate: parsed.timing === "FIXED_DATE" ? parsed.fixedDate : null,
    note: parsed.note || null,
  }
}
