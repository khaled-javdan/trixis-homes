"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { Flashcard } from "@/components/study/flashcard"
import type { Flashcard as FlashcardData } from "@/lib/study/flashcards"

export function FlashcardSession({ cards }: { cards: FlashcardData[] }) {
  const [prevCards, setPrevCards] = React.useState(cards)
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)

  if (cards !== prevCards) {
    setPrevCards(cards)
    setIndex(0)
    setFlipped(false)
  }

  if (cards.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No projects available yet — add a project to generate flashcards.
      </p>
    )
  }

  const current = cards[index]!

  function go(delta: number) {
    setFlipped(false)
    setIndex((value) => (value + delta + cards.length) % cards.length)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Card {index + 1} of {cards.length}
        </p>
        <div className="h-1 w-full max-w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>
      <Flashcard
        card={current}
        flipped={flipped}
        onToggle={() => setFlipped((value) => !value)}
      />
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="lg" onClick={() => go(-1)}>
          <ChevronLeftIcon /> Previous
        </Button>
        <Button size="lg" onClick={() => go(1)}>
          Next <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
