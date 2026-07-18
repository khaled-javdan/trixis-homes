import { z } from "zod"

export const leadTypeValues = [
  "BROCHURE",
  "FLOOR_PLAN",
  "PRICE_LIST",
  "ENQUIRY",
] as const

export const leadSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phone: z.string().trim().min(5).max(32).optional().or(z.literal("").transform(() => undefined)),
    message: z.string().trim().min(1).max(2000).optional().or(z.literal("").transform(() => undefined)),
    type: z.enum(leadTypeValues).default("ENQUIRY"),
    projectId: z.string().trim().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ENQUIRY") {
      // A callback request only needs a phone number.
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone number is required",
        })
      }
    } else if (!data.email) {
      // Gated downloads are delivered by email, so it's required there.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email address is required",
      })
    }
  })

export type LeadInput = z.infer<typeof leadSchema>
