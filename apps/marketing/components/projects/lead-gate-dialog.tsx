"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

import { LeadForm, type LeadType } from "@/components/projects/lead-form"

const dialogCopy: Record<
  LeadType,
  { title: (name: string) => string; description: string; submit: string }
> = {
  BROCHURE: {
    title: (name) => `Download the ${name} brochure`,
    description:
      "Fill in your details below and we'll unlock the brochure right away. Our team is also on hand to answer any questions.",
    submit: "Download Now",
  },
  FLOOR_PLAN: {
    title: (name) => `Get floor plans for ${name}`,
    description:
      "Leave your details and we'll unlock the floor plans right away, with layouts for every unit type.",
    submit: "Get Floor Plans",
  },
  PRICE_LIST: {
    title: (name) => `Get the ${name} price list`,
    description:
      "Leave your details and we'll unlock the latest availability and pricing right away.",
    submit: "Get Price List",
  },
  ENQUIRY: {
    title: (name) => `Get a callback about ${name}`,
    description:
      "Leave your name and number — one of our advisors will call you back with floor plans, availability, and pricing.",
    submit: "Request a Callback",
  },
}

export function LeadGateDialog({
  projectId,
  projectName,
  leadType,
  triggerClassName,
  children,
}: {
  projectId: string
  projectName: string
  leadType: LeadType
  triggerClassName?: string
  children: React.ReactNode
}) {
  const copy = dialogCopy[leadType]

  return (
    <Dialog>
      <DialogTrigger className={triggerClassName}>{children}</DialogTrigger>
      <DialogContent className="rounded-none bg-white p-8 text-ink sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl leading-snug text-ink">
            {copy.title(projectName)}
          </DialogTitle>
          <DialogDescription className="text-sm/6 text-ink/60">
            {copy.description}
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          projectId={projectId}
          leadType={leadType}
          submitLabel={copy.submit}
        />
      </DialogContent>
    </Dialog>
  )
}
