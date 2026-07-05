import { z } from "zod"

export const noteSchema = z.object({
  body: z.string().trim().min(1).max(4000),
})

export type NoteInput = z.infer<typeof noteSchema>
