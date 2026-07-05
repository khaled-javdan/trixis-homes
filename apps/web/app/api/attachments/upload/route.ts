import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

import { allowedAttachmentContentTypes } from "@workspace/db/validation/attachment"

export async function POST(request: Request) {
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
