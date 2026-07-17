import { Star } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { googleRating, reviews } from "@/lib/content"

function Stars({ className }: { className?: string }) {
  return (
    <div className={className} aria-label="Rated 5 out of 5 stars">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="size-4 fill-copper text-copper"
            aria-hidden
          />
        ))}
      </div>
    </div>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-20 bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="What Our Clients Say"
          title="Rated 5.0 by the people we've moved home."
        />

        <div className="mb-14 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-foreground/10 py-6">
          <span className="font-heading text-5xl">{googleRating.score}</span>
          <div>
            <Stars />
            <p className="mt-1.5 text-sm text-muted-foreground">
              Based on {googleRating.count} Google reviews
            </p>
          </div>
        </div>

        <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="mb-5 break-inside-avoid bg-secondary p-7"
            >
              <Stars />
              <blockquote className="mt-4 text-sm/6 text-foreground/85">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {"note" in review && review.note
                    ? `Google Review · ${review.note}`
                    : "Google Review"}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
