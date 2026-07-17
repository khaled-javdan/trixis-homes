import { z } from "zod"

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined))

export const developerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: optionalTrimmed(5000),
  coverImageUrl: optionalTrimmed(2048),
  logoUrl: optionalTrimmed(2048),
  websiteUrl: optionalTrimmed(2048),
})

export type DeveloperInput = z.infer<typeof developerSchema>
