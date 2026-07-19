import Link from "next/link"
import { redirect } from "next/navigation"
import { InboxIcon } from "lucide-react"

import type { LeadType } from "@workspace/db"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { isAdmin } from "@/lib/auth"
import { getLeads } from "@/lib/data/leads"
import { formatDateShort } from "@/lib/format"

const leadTypeLabels: Record<LeadType, string> = {
  BROCHURE: "Brochure",
  FLOOR_PLAN: "Floor Plans",
  PRICE_LIST: "Price List",
  ENQUIRY: "Enquiry",
}

export default async function LeadsPage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const leads = await getLeads()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contacts captured on the public site — brochure and floor plan
          requests, price list downloads, and enquiries.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <InboxIcon className="size-8 text-muted-foreground/50" />
          <div>
            <p className="font-medium">No leads yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish a project to the marketing site and leads will land here
              as visitors request brochures and floor plans.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateShort(lead.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-primary hover:underline"
                      >
                        {lead.email}
                      </a>
                    ) : null}
                    {lead.phone ? (
                      <p className="text-muted-foreground">{lead.phone}</p>
                    ) : null}
                    {!lead.email && !lead.phone ? (
                      <span className="text-muted-foreground">—</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {leadTypeLabels[lead.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.projectId ? (
                      <Link
                        href={`/projects/${lead.projectId}`}
                        className="hover:underline"
                      >
                        {lead.projectName ?? "View project"}
                      </Link>
                    ) : (
                      (lead.projectName ?? "—")
                    )}
                  </TableCell>
                  <TableCell className="max-w-72">
                    <p className="truncate" title={lead.message ?? undefined}>
                      {lead.message ?? "—"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
