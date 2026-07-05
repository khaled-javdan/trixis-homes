import { z } from "zod"

export const attachmentCategoryValues = [
  "BROCHURE",
  "FLOOR_PLAN",
  "IMAGE",
  "PRICE_LIST",
  "OTHER",
] as const

export const attachmentSchema = z.object({
  projectId: z.string().min(1),
  filename: z.string().trim().min(1).max(300),
  url: z.string().url(),
  pathname: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  category: z.enum(attachmentCategoryValues),
})

export type AttachmentInput = z.infer<typeof attachmentSchema>

export const allowedAttachmentContentTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const
