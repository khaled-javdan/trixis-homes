"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import { noteSchema, type NoteInput } from "@workspace/db/validation/note"

export async function createNote(projectId: string, input: NoteInput) {
  const parsed = noteSchema.parse(input)
  const note = await prisma.note.create({
    data: { projectId, body: parsed.body },
  })
  revalidatePath(`/projects/${projectId}`)
  return { id: note.id }
}

export async function updateNote(
  id: string,
  projectId: string,
  input: NoteInput
) {
  const parsed = noteSchema.parse(input)
  await prisma.note.update({ where: { id }, data: { body: parsed.body } })
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteNote(id: string, projectId: string) {
  await prisma.note.delete({ where: { id } })
  revalidatePath(`/projects/${projectId}`)
}
