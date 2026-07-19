"use server"

import { randomInt } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@workspace/db"

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth"
import { sendEmail } from "@/lib/email"

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const OTP_MAX_ATTEMPTS = 5
const MIN_PASSWORD_LENGTH = 8

export type LoginState = { error: string } | null

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")
  const password = formData.get("password")
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Enter your email and password" }
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  // Same message whether the email is unknown or the password is wrong, so we
  // don't reveal which team emails have accounts.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password" }
  }
  if (user.status === "DISABLED") {
    return { error: "This account has been disabled" }
  }

  await prisma.user.update({
    where: { id: user.id },
    // First login promotes an INVITED account to ACTIVE.
    data: { lastLoginAt: new Date(), status: "ACTIVE" },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  })

  const next = formData.get("next")
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/")
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect("/")
}

// --- Forgot-password OTP flow ------------------------------------------------

/**
 * Emails a one-time code to the account with this email, if it exists and is
 * active. Always resolves the same way so callers can't probe which emails have
 * accounts.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalized } })
  if (!user || user.status !== "ACTIVE") return

  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0")
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetOtpHash: hashPassword(otp),
      resetOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
      resetOtpAttempts: 0,
    },
  })

  await sendEmail({
    to: user.email,
    subject: "Your Trixis Homes password reset code",
    text:
      `Your password reset code is ${otp}.\n\n` +
      `It expires in 10 minutes. If you didn't request this, you can ignore ` +
      `this email — your password won't change.`,
  })
}

export type ResetResult = { ok: true } | { ok: false; error: string }

/** Verifies the OTP and sets a new password. */
export async function resetPasswordWithOtp(input: {
  email: string
  otp: string
  newPassword: string
}): Promise<ResetResult> {
  const email = input.email.trim().toLowerCase()
  const otp = input.otp.trim()

  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const expired =
    !user?.resetOtpExpiresAt || user.resetOtpExpiresAt.getTime() < Date.now()
  if (!user || !user.resetOtpHash || expired) {
    return { ok: false, error: "That code has expired. Request a new one." }
  }
  if (user.resetOtpAttempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Request a new code." }
  }

  if (!verifyPassword(otp, user.resetOtpHash)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtpAttempts: { increment: 1 } },
    })
    return { ok: false, error: "Incorrect code." }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(input.newPassword),
      resetOtpHash: null,
      resetOtpExpiresAt: null,
      resetOtpAttempts: 0,
    },
  })
  return { ok: true }
}

/** Changes the signed-in user's own password (requires the current one). */
export async function changeOwnPassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<ResetResult> {
  const session = await requireAdmin()

  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    }
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || !verifyPassword(input.currentPassword, user.passwordHash)) {
    return { ok: false, error: "Current password is incorrect" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(input.newPassword) },
  })
  return { ok: true }
}
