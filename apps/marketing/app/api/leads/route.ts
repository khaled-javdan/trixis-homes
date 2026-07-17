import { NextResponse } from "next/server"

import { prisma, type AttachmentCategory } from "@workspace/db"
import { leadSchema } from "@workspace/db/validation/lead"

// Gated download types map 1:1 onto attachment categories; ENQUIRY unlocks
// nothing and is just a contact request.
const gatedCategories: Partial<Record<string, AttachmentCategory>> = {
  BROCHURE: "BROCHURE",
  FLOOR_PLAN: "FLOOR_PLAN",
  PRICE_LIST: "PRICE_LIST",
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = leadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details and try again." },
      { status: 400 }
    )
  }

  const { name, email, phone, message, type, projectId } = parsed.data

  // Only published projects exist as far as the public API is concerned.
  const project = projectId
    ? await prisma.project.findFirst({
        where: { id: projectId, isPublished: true },
        select: { id: true, name: true },
      })
    : null
  if (projectId && !project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 })
  }

  await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      message,
      type,
      projectId: project?.id,
      projectName: project?.name,
    },
  })

  const category = gatedCategories[type]
  const files =
    project && category
      ? await prisma.attachment.findMany({
          where: { projectId: project.id, category },
          orderBy: { uploadedAt: "asc" },
          select: { filename: true, url: true },
        })
      : []

  return NextResponse.json({ ok: true, files })
}
