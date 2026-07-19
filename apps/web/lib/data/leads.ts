import "server-only"

import { prisma, type LeadType } from "@workspace/db"

export type LeadRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  type: LeadType
  projectId: string | null
  projectName: string | null
  createdAt: string
}

/** Total leads created within [since, until). */
export async function getLeadTotal(since: Date, until: Date): Promise<number> {
  return prisma.lead.count({
    where: { createdAt: { gte: since, lt: until } },
  })
}

/**
 * Leads per calendar day within [since, until), keyed by YYYY-MM-DD (UTC). Days
 * with no leads are omitted; the caller fills gaps against its date axis.
 */
export async function getLeadCountsByDay(
  since: Date,
  until: Date
): Promise<Record<string, number>> {
  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: since, lt: until } },
    select: { createdAt: true },
  })

  const counts: Record<string, number> = {}
  for (const lead of leads) {
    const day = lead.createdAt.toISOString().slice(0, 10)
    counts[day] = (counts[day] ?? 0) + 1
  }
  return counts
}

export async function getLeads(): Promise<LeadRow[]> {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    type: lead.type,
    projectId: lead.projectId,
    projectName: lead.projectName,
    createdAt: lead.createdAt.toISOString(),
  }))
}
