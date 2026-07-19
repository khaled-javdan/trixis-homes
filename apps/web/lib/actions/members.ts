"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"

import { prisma, type UserRole } from "@workspace/db"

import { hashPassword, requireAdmin, requireOwner } from "@/lib/auth"

// Readable one-time password the owner shares with the new member. Avoids
// ambiguous characters (0/O, 1/l) so it can be typed by hand if needed.
function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  const bytes = randomBytes(14)
  let out = ""
  for (const byte of bytes) out += alphabet[byte % alphabet.length]
  return out
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Blocks any change that would leave the app with no active owner. */
async function assertNotLastOwner(userId: string): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target || target.role !== "OWNER" || target.status !== "ACTIVE") return
  const activeOwners = await prisma.user.count({
    where: { role: "OWNER", status: "ACTIVE" },
  })
  if (activeOwners <= 1) {
    throw new Error("You can't remove the last active owner.")
  }
}

export async function inviteMember(input: {
  name: string
  email: string
  role: UserRole
  title?: string
  phone?: string
}): Promise<{ tempPassword: string }> {
  await requireOwner()

  const email = normalizeEmail(input.email)
  const name = input.name.trim()
  if (!email) throw new Error("Email is required")

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("A member with that email already exists")

  const tempPassword = generateTempPassword()
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      title: input.title?.trim() || null,
      phone: input.phone?.trim() || null,
      role: input.role,
      // Stays INVITED until their first sign-in flips it to ACTIVE.
      status: "INVITED",
      passwordHash: hashPassword(tempPassword),
    },
  })

  revalidatePath("/members")
  return { tempPassword }
}

/** Self-service profile edit for the signed-in user. */
export async function updateOwnProfile(input: {
  name: string
  title: string
  phone: string
  avatarUrl: string
}): Promise<void> {
  const session = await requireAdmin()
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: input.name.trim() || null,
      title: input.title.trim() || null,
      phone: input.phone.trim() || null,
      avatarUrl: input.avatarUrl.trim() || null,
    },
  })
  revalidatePath("/account")
  revalidatePath("/members")
}

export async function setMemberRole(
  userId: string,
  role: UserRole
): Promise<void> {
  await requireOwner()
  if (role !== "OWNER") await assertNotLastOwner(userId)
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/members")
}

export async function setMemberStatus(
  userId: string,
  status: "ACTIVE" | "DISABLED"
): Promise<void> {
  await requireOwner()
  if (status === "DISABLED") await assertNotLastOwner(userId)
  await prisma.user.update({ where: { id: userId }, data: { status } })
  revalidatePath("/members")
}

export async function resetMemberPassword(
  userId: string
): Promise<{ tempPassword: string }> {
  await requireOwner()
  const tempPassword = generateTempPassword()
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(tempPassword) },
  })
  revalidatePath("/members")
  return { tempPassword }
}

export async function deleteMember(userId: string): Promise<void> {
  const session = await requireOwner()
  if (session.userId === userId) {
    throw new Error("You can't delete your own account")
  }
  await assertNotLastOwner(userId)
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath("/members")
}
