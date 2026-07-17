import "server-only"

import { prisma, type LeadType } from "@workspace/db"

export type LeadRow = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  type: LeadType
  projectId: string | null
  projectName: string | null
  createdAt: string
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
