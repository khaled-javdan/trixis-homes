import { z } from "zod"

const objectionSchema = z.object({
  objection: z.string(),
  response: z.string(),
})

const topMatchSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  developer: z.string(),
  whyMatch: z.string(),
  pros: z.array(z.string()).max(6),
  cons: z.array(z.string()).max(6),
  objections: z.array(objectionSchema).max(4),
})

export const salesReportSchema = z.object({
  clientSummary: z.string(),
  topMatches: z.array(topMatchSchema).max(3),
  talkingPoints: z.array(z.string()).max(5),
  upsell: z.array(z.string()).max(5),
  crossSell: z.array(z.string()).max(5),
})

export type SalesReport = z.infer<typeof salesReportSchema>
