import Image from "next/image"

import { Eyebrow, SectionHeading } from "@/components/section-heading"
import { team, teamLevelTwo } from "@/lib/content"

type Member = (typeof team)[number]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function MemberCard({
  member,
  compact = false,
}: {
  member: Member
  compact?: boolean
}) {
  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden">
        {member.image ? (
          <Image
            src={member.image}
            alt={`Portrait of ${member.name}`}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-ink/5 transition-colors duration-500 group-hover:bg-ink/10"
            aria-hidden
          >
            <span className="font-heading text-5xl text-ink/30">
              {initials(member.name)}
            </span>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-copper transition-transform duration-500 group-hover:scale-x-100"
          aria-hidden
        />
      </div>
      <h3
        className={`font-heading ${compact ? "mt-4 text-sm" : "mt-5 text-lg"}`}
      >
        {member.name}
      </h3>
      <p
        className={`mt-1 uppercase tracking-[0.15em] text-muted-foreground ${
          compact ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {member.role}
      </p>
      {!compact && (
        <a
          href={`mailto:${member.email}`}
          className="mt-2 inline-block text-sm text-copper transition-colors hover:text-copper-deep"
        >
          {member.email}
        </a>
      )}
    </div>
  )
}

function MemberCarousel({
  members,
  reverse = false,
  compact = false,
}: {
  members: Member[]
  reverse?: boolean
  compact?: boolean
}) {
  return (
    <div className="group relative -mx-6 overflow-hidden px-6 lg:-mx-10 lg:px-10">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-secondary to-transparent sm:w-24 lg:w-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-secondary to-transparent sm:w-24 lg:w-32"
        aria-hidden
      />
      <div
        className={`animate-marquee flex w-max group-hover:[animation-play-state:paused] ${
          compact ? "gap-4" : "gap-6"
        } ${reverse ? "[animation-direction:reverse]" : ""}`}
      >
        {[...members, ...members].map((member, i) => (
          <div
            key={`${member.name}-${i}`}
            className={
              compact
                ? "w-28 shrink-0 sm:w-32 lg:w-36"
                : "w-44 shrink-0 sm:w-52 lg:w-56"
            }
            aria-hidden={i >= members.length}
          >
            <MemberCard member={member} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Team() {
  return (
    <section id="team" className="scroll-mt-20 bg-secondary py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Meet Our Leadership"
          title="The people behind every handover."
          lede="A leadership team that combines decades of Dubai market experience with a client-first philosophy."
        />
        <MemberCarousel members={team} />

        <div className="mt-24 lg:mt-32">
          <Eyebrow>Our Sales &amp; Advisory Team</Eyebrow>
          <p className="mt-4 mb-10 max-w-xl text-base/7 text-muted-foreground">
            The consultants who guide every viewing, negotiation, and handover —
            on the ground and on your side.
          </p>
          <MemberCarousel members={teamLevelTwo} reverse compact />
        </div>
      </div>
    </section>
  )
}
