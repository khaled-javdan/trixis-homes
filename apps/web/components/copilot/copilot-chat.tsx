"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { FileTextIcon, SendIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { generateSalesReport } from "@/lib/actions/copilot"
import type { CopilotProjectSummary } from "@/lib/copilot/context"
import type { SalesReport } from "@/lib/copilot/sales-report-schema"

import { SalesReportView } from "@/components/copilot/sales-report"

const GREETING =
  "Hi! Tell me a bit about your client and I'll help you find the best match from the projects currently in scope — what's their main purpose: investment, end use, or a holiday home?"

export function CopilotChat({
  projects,
  filterChips,
}: {
  projects: CopilotProjectSummary[]
  filterChips: string[]
}) {
  const [input, setInput] = React.useState("")
  const [report, setReport] = React.useState<SalesReport | null>(null)
  const [generating, startGenerating] = React.useTransition()
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/copilot/chat",
        body: { projects, filterChips },
      }),
    [projects, filterChips]
  )

  const { messages, sendMessage, status } = useChat({ transport })

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!input.trim()) return
    sendMessage({ text: input })
    setInput("")
  }

  function handleGenerateReport() {
    startGenerating(async () => {
      try {
        const transcript = messages
          .map((message) =>
            message.parts
              .filter((part) => part.type === "text")
              .map((part) => `${message.role}: ${part.text}`)
              .join("\n")
          )
          .filter(Boolean)
          .join("\n")
        const result = await generateSalesReport(projects, filterChips, transcript)
        setReport(result)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to generate report"
        )
      }
    })
  }

  const isBusy = status === "submitted" || status === "streaming"
  const canGenerateReport = messages.length > 0 && !isBusy

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
            <ChatBubble role="assistant">{GREETING}</ChatBubble>
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role}>
                {message.parts
                  .filter((part) => part.type === "text")
                  .map((part, i) => (
                    <React.Fragment key={i}>{part.text}</React.Fragment>
                  ))}
              </ChatBubble>
            ))}
            {isBusy ? (
              <ChatBubble role="assistant">
                <span className="text-muted-foreground">Thinking…</span>
              </ChatBubble>
            ) : null}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell the copilot about your client…"
              disabled={isBusy}
            />
            <Button type="submit" disabled={isBusy || !input.trim()}>
              <SendIcon />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={!canGenerateReport || generating}
          onClick={handleGenerateReport}
        >
          <FileTextIcon />
          {generating ? "Generating…" : "Generate Sales Mode Report"}
        </Button>
      </div>

      {report ? <SalesReportView report={report} /> : null}
    </div>
  )
}

function ChatBubble({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2",
        role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      {role !== "user" ? (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SparklesIcon className="size-3.5" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {children}
      </div>
    </div>
  )
}
