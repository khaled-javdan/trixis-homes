"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import type { PaymentMilestoneInput } from "@workspace/db/validation/payment-milestone"

import { toPaymentMilestoneData } from "@/lib/actions/prisma-mappers"

export async function createPaymentMilestone(
  projectId: string,
  input: PaymentMilestoneInput
) {
  const count = await prisma.paymentMilestone.count({ where: { projectId } })
  const milestone = await prisma.paymentMilestone.create({
    data: { ...toPaymentMilestoneData(input), projectId, sortOrder: count },
  })
  revalidatePath(`/projects/${projectId}`)
  return { id: milestone.id }
}

export async function updatePaymentMilestone(
  id: string,
  projectId: string,
  input: PaymentMilestoneInput
) {
  await prisma.paymentMilestone.update({
    where: { id },
    data: toPaymentMilestoneData(input),
  })
  revalidatePath(`/projects/${projectId}`)
}

export async function deletePaymentMilestone(id: string, projectId: string) {
  await prisma.paymentMilestone.delete({ where: { id } })
  revalidatePath(`/projects/${projectId}`)
}

export async function movePaymentMilestone(
  id: string,
  projectId: string,
  direction: "up" | "down"
) {
  const milestones = await prisma.paymentMilestone.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  })
  const index = milestones.findIndex((milestone) => milestone.id === id)
  const swapIndex = direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapIndex < 0 || swapIndex >= milestones.length) return

  const current = milestones[index]!
  const neighbor = milestones[swapIndex]!
  await prisma.$transaction([
    prisma.paymentMilestone.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.paymentMilestone.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ])
  revalidatePath(`/projects/${projectId}`)
}
