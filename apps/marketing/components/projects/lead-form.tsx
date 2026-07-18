"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, Download, Loader2 } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export type LeadType = "BROCHURE" | "FLOOR_PLAN" | "PRICE_LIST" | "ENQUIRY"

type LeadFile = { filename: string; url: string }

const inputClassName =
  "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 transition-colors focus:border-copper focus:outline-none"

const successCopy: Record<LeadType, string> = {
  BROCHURE: "Your brochure is ready to download.",
  FLOOR_PLAN: "Your floor plans are ready to download.",
  PRICE_LIST: "The price list is ready to download.",
  ENQUIRY: "Thank you — one of our advisors will call you back shortly.",
}

export function LeadForm({
  projectId,
  leadType,
  submitLabel,
  className,
}: {
  projectId?: string
  leadType: LeadType
  submitLabel: string
  className?: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ files: LeadFile[] } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          message: form.get("message"),
          type: leadType,
          projectId,
        }),
      })
      const json = (await response.json().catch(() => null)) as
        | { files?: LeadFile[]; error?: string }
        | null
      if (!response.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.")
        return
      }
      setResult({ files: json?.files ?? [] })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const gated = leadType !== "ENQUIRY"
    return (
      <div className={cn("flex flex-col items-start gap-4", className)}>
        <p className="flex items-center gap-2.5 text-sm text-ink">
          <CheckCircle2 className="size-5 shrink-0 text-copper" aria-hidden />
          {gated && result.files.length === 0
            ? "Thank you — our team will send the files to your email shortly."
            : successCopy[leadType]}
        </p>
        {result.files.map((file) => (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-copper px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
          >
            <Download className="size-3.5" aria-hidden />
            {file.filename}
          </a>
        ))}
      </div>
    )
  }

  const isEnquiry = leadType === "ENQUIRY"

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", className)}>
      {isEnquiry ? (
        // Callback requests: keep it to the essentials — name and phone.
        <>
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            placeholder="Full name"
            aria-label="Full name"
            className={inputClassName}
          />
          <input
            name="phone"
            type="tel"
            required
            minLength={5}
            maxLength={32}
            autoComplete="tel"
            placeholder="Phone number"
            aria-label="Phone number"
            className={inputClassName}
          />
        </>
      ) : (
        // Gated downloads: email is required to deliver the files.
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Full name"
              aria-label="Full name"
              className={inputClassName}
            />
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="Email address"
              aria-label="Email address"
              className={inputClassName}
            />
          </div>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
            placeholder="Phone (e.g. +971 50 123 4567)"
            aria-label="Phone number"
            className={inputClassName}
          />
          <textarea
            name="message"
            rows={3}
            maxLength={2000}
            placeholder="Something specific in mind? Tell us here. (optional)"
            aria-label="Message"
            className={cn(inputClassName, "resize-none")}
          />
        </>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink-deep disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {submitLabel}
      </button>
      <p className="text-xs text-ink/45">
        By submitting, you agree to be contacted by Trixis Homes about this
        enquiry. We never share your details with third parties.
      </p>
    </form>
  )
}
