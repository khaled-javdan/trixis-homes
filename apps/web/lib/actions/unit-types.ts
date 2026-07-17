"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import type { UnitTypeInput } from "@workspace/db/validation/unit-type"

import { toUnitTypeData } from "@/lib/actions/prisma-mappers"
import { requireAdmin } from "@/lib/auth"

export async function createUnitType(projectId: string, input: UnitTypeInput) {
  await requireAdmin()
  const unit = await prisma.unitType.create({
    data: { ...toUnitTypeData(input), projectId },
  })
  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/")
  return { id: unit.id }
}

export async function updateUnitType(
  id: string,
  projectId: string,
  input: UnitTypeInput
) {
  await requireAdmin()
  await prisma.unitType.update({ where: { id }, data: toUnitTypeData(input) })
  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/")
}

export async function deleteUnitType(id: string, projectId: string) {
  await requireAdmin()
  await prisma.unitType.delete({ where: { id } })
  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/")
}
