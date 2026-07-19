import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

import { allowedAttachmentContentTypes } from "@workspace/db/validation/attachment"

import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  // Any signed-in user may upload (e.g. their own profile photo); attaching a
  // blob to a project still goes through owner-gated actions.
  if (!(await getSession())) {
    return NextResponse.json({ error: "Sign-in required" }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...allowedAttachmentContentTypes],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // The Attachment DB row is created client-side right after upload() resolves
        // (this callback doesn't reliably fire against localhost in dev).
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    )
  }
}
