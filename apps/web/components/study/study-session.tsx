"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowRightIcon, BuildingIcon, EyeIcon } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

import type { QAPair } from "@/lib/study/generate-questions"

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]!
    copy[j] = temp!
  }
  return copy
}

export function StudySession({ questions }: { questions: QAPair[] }) {
  // Start with the server-rendered (unshuffled) order so hydration matches exactly,
  // then shuffle client-side only — Math.random() can't run during SSR without
  // producing a server/client markup mismatch.
  const [pool, setPool] = React.useState(questions)
  const [index, setIndex] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    // Intentionally client-only: shuffling during render (even in an initializer)
    // would run on the server too and desync from the client's random order.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPool(shuffle(questions))
    setIndex(0)
    setRevealed(false)
  }, [questions])

  if (pool.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Not enough project data yet to generate questions. Add unit types,
        pricing, or a payment plan first.
      </p>
    )
  }

  const current = pool[index]!

  function next() {
    setRevealed(false)
    setIndex((value) => (value + 1) % pool.length)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Question {index + 1} of {pool.length}
        </p>
        <div className="h-1 w-full max-w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / pool.length) * 100}%` }}
          />
        </div>
      </div>
      <Card className="gap-0 overflow-hidden p-0 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {current.project.coverImageUrl ? (
              <Image
                src={current.project.coverImageUrl}
                alt={current.project.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BuildingIcon className="size-4 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {current.project.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {current.project.location}
            </p>
          </div>
        </div>
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 bg-gradient-to-b from-primary/[0.03] to-transparent px-6 py-10 text-center">
          <Badge className="bg-primary/10 text-primary">
            {current.category}
          </Badge>
          <p className="text-xl font-semibold text-balance">{current.prompt}</p>
          {revealed && (
            <p className="text-lg font-medium text-primary">{current.answer}</p>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-center gap-2">
        {!revealed ? (
          <Button size="lg" onClick={() => setRevealed(true)}>
            <EyeIcon /> Show Answer
          </Button>
        ) : (
          <Button size="lg" onClick={next}>
            Next Question <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  )
}
