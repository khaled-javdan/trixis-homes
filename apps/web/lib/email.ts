import "server-only"

import { Resend } from "resend"

// Sends transactional email via Resend when RESEND_API_KEY is set. Until it is
// (e.g. before the sending domain is verified), emails fall back to the server
// log so flows like password reset stay testable in development.

const FROM =
  process.env.EMAIL_FROM ?? "Trixis Homes <no-reply@trixishomes.com>"

export type EmailMessage = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY not set — logging instead of sending.\n` +
        `  to: ${message.to}\n  subject: ${message.subject}\n  ${message.text}`
    )
    return
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: FROM,
    to: message.to,
    subject: message.subject,
    text: message.text,
    ...(message.html ? { html: message.html } : {}),
  })
  if (error) {
    // Surface as a thrown error so callers can decide how to handle it.
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
