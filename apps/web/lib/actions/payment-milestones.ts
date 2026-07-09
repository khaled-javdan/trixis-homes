"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@workspace/db"
import type { PaymentMilestoneInput } from "@workspace/db/validation/payment-milestone"

import { toPaymentMilestoneData } from "@/lib/actions/prisma-mappers"

export async function createPaymentMilestone(
  projectId: string,
  input: PaymentMilestoneInput
) {
  const milestone = await prisma.paymentMilestone.create({
    data: { ...toPaymentMilestoneData(input), projectId },
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
