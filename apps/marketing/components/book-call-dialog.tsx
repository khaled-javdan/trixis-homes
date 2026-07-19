"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

import { LeadForm } from "@/components/projects/lead-form"

// Matches the copper CtaLink these triggers replace, so "Book a Call" looks
// identical whether it opens this dialog or (elsewhere) links to WhatsApp.
const copperCta =
  "inline-flex items-center justify-center gap-2.5 px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 bg-copper text-white hover:bg-copper-deep"

export function BookCallDialog({
  className,
  children = "Book a Call",
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger className={cn(copperCta, className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-none bg-white p-8 text-ink sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl leading-snug text-ink">
            Book a call with our team
          </DialogTitle>
          <DialogDescription className="text-sm/6 text-ink/60">
            Leave your name and number — one of our advisors will call you back
            to talk through your requirements, no obligation.
          </DialogDescription>
        </DialogHeader>
        <LeadForm leadType="ENQUIRY" submitLabel="Request a Callback" />
      </DialogContent>
    </Dialog>
  )
}
