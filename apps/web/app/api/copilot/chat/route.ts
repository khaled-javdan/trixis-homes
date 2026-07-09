import { convertToModelMessages, streamText, type UIMessage } from "ai"

import type { CopilotProjectSummary } from "@/lib/copilot/context"
import { buildCopilotSystemPrompt } from "@/lib/copilot/prompt"

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    messages,
    projects,
    filterChips,
  }: {
    messages: UIMessage[]
    projects: CopilotProjectSummary[]
    filterChips: string[]
  } = await req.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-5",
    system: buildCopilotSystemPrompt(projects, filterChips),
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
