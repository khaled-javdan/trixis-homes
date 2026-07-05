"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import {
  attachmentSchema,
  type AttachmentInput,
} from "@workspace/db/validation/attachment"

export async function createAttachmentRecord(input: AttachmentInput) {
  const parsed = attachmentSchema.parse(input)
  const attachment = await prisma.attachment.create({ data: parsed })
  revalidatePath(`/projects/${parsed.projectId}`)
  return { id: attachment.id }
}

export async function deleteAttachment(id: string, projectId: string) {
  const attachment = await prisma.attachment.findUnique({ where: { id } })
  if (!attachment) return

  try {
    await del(attachment.url)
  } catch (error) {
    console.error(`Failed to delete blob for attachment ${id}:`, error)
  }

  await prisma.attachment.delete({ where: { id } })
  revalidatePath(`/projects/${projectId}`)
}
