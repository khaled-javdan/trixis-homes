"use client"

import Image from "next/image"
import { BuildingIcon, MapPinIcon, RotateCwIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import type { Flashcard as FlashcardData } from "@/lib/study/flashcards"

export function Flashcard({
  card,
  flipped,
  onToggle,
}: {
  card: FlashcardData
  flipped: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="block h-80 w-full text-left [perspective:1200px]"
      aria-pressed={flipped}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-foreground/10 [backface-visibility:hidden]">
          {card.coverImageUrl ? (
            <>
              <Image
                src={card.coverImageUrl}
                alt={card.front}
                fill
                sizes="(min-width: 640px) 36rem, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/0" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-6 text-center">
                <p className="text-2xl font-semibold text-balance text-white">
                  {card.front}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <RotateCwIcon className="size-3.5" /> Click to reveal
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary/[0.06] to-transparent">
              <BuildingIcon className="size-8 text-muted-foreground/40" />
              <p className="text-2xl font-semibold text-balance">
                {card.front}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCwIcon className="size-3.5" /> Click to reveal
              </p>
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col gap-3 overflow-y-auto rounded-xl bg-card p-6 text-sm shadow-sm ring-1 ring-foreground/10 [backface-visibility:hidden]">
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 text-sm font-semibold">
            <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
            {card.back.location}
          </div>
          <Row label="Developer" value={card.back.developer} />
          <Row label="Status" value={card.back.status} />
          <Row
            label="Starting Price"
            value={card.back.startingPrice ?? "—"}
            highlight
          />
          <Row label="Payment Plan" value={card.back.paymentPlan ?? "—"} />
          <Row label="Handover" value={card.back.handoverDate ?? "—"} />
          {card.back.unitTypesSummary.length > 0 && (
            <Row
              label="Unit Types"
              value={card.back.unitTypesSummary.join(", ")}
            />
          )}
          {card.back.notesExcerpt && (
            <Row label="Notes" value={card.back.notesExcerpt} />
          )}
        </div>
      </div>
    </button>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="border-b border-border/60 pb-2 last:border-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-medium", highlight && "text-primary")}>{value}</p>
    </div>
  )
}
