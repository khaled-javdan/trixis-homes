"use server"

import { generateText, Output } from "ai"

import type { CopilotProjectSummary } from "@/lib/copilot/context"
import {
  salesReportSchema,
  type SalesReport,
} from "@/lib/copilot/sales-report-schema"

const SYSTEM_PROMPT = `You are an AI Sales Copilot for a UAE real estate brokerage
that sells projects from many developers. You are given the exact list of
projects the broker has filtered into scope (AVAILABLE_PROJECTS) and the
qualification conversation the broker had with their client so far.

Produce a "Sales Mode" briefing the broker can use in the room with the client:
- clientSummary: 2-3 sentences summarizing who this client is and what they
  need, based only on the conversation transcript.
- topMatches: the best-fitting 1-3 projects, chosen ONLY from
  AVAILABLE_PROJECTS and ranked by how well they fit the client's stated
  budget, lifestyle, purpose (investment/end-use/holiday home), payment plan
  preference, preferred location, and completion timeline. Use the exact
  projectId from AVAILABLE_PROJECTS. For each: whyMatch (1-2 sentences),
  3-5 pros, 1-3 cons, and up to 3 likely objections with a suggested response
  for each.
- talkingPoints: up to 5 short, punchy talking points a broker could use live.
- upsell: opportunities to move the client to a higher-value unit/project
  still within AVAILABLE_PROJECTS.
- crossSell: complementary opportunities (e.g. a second unit as investment,
  a different project in the list for a family member) still within
  AVAILABLE_PROJECTS.

Never reference a project, developer, price, or amenity that is not present
in AVAILABLE_PROJECTS. If the transcript is thin on qualification detail, make
reasonable, clearly-hedged assumptions rather than inventing client facts.`

export async function generateSalesReport(
  projects: CopilotProjectSummary[],
  filterChips: string[],
  transcript: string
): Promise<SalesReport> {
  const { output } = await generateText({
    model: "anthropic/claude-sonnet-5",
    system: SYSTEM_PROMPT,
    output: Output.object({ schema: salesReportSchema }),
    prompt: `Active filters: ${
      filterChips.length ? filterChips.join("; ") : "none — every project is in scope"
    }

AVAILABLE_PROJECTS (JSON):
${JSON.stringify(projects)}

CONVERSATION TRANSCRIPT:
${transcript || "(no qualification conversation yet — work from the filters alone)"}`,
  })

  return output
}
