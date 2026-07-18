import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  Download,
  MapPin,
  Ruler,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { LeadForm } from "@/components/projects/lead-form"
import { LeadGateDialog } from "@/components/projects/lead-gate-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import { SectionNav, type SectionLink } from "@/components/projects/section-nav"
import { Eyebrow } from "@/components/section-heading"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import {
  formatBedroomsList,
  formatHandoverQuarter,
  formatHandoverYear,
  formatPaymentPlanShort,
  formatPriceShort,
  formatProjectStatus,
  formatPropertyTypes,
  formatSizeRange,
} from "@/lib/format"
import {
  getOtherPublishedProjects,
  getPublishedProject,
  type PublicProjectDetail,
} from "@/lib/projects"

// Publishing and content edits happen in the admin app; always read fresh.
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProject(slug)
  if (!project) return { title: "Project not found — Trixis Homes" }
  return {
    title: `${project.name} by ${project.developer} — Trixis Homes`,
    description:
      project.description?.slice(0, 160) ??
      `${project.name} by ${project.developer} in ${project.area}. Register your interest for brochures, floor plans, and availability.`,
  }
}

const primaryCta =
  "inline-flex items-center justify-center gap-2 bg-copper px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-copper-deep"
const heroSecondaryCta =
  "inline-flex items-center justify-center gap-2 border border-white/40 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white/10"
const outlineCta =
  "inline-flex items-center justify-center gap-2 border border-ink/20 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-copper hover:text-copper"

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        {label}
      </p>
      <p className="mt-1.5 font-heading text-2xl text-white sm:text-[1.7rem]">
        {value}
      </p>
    </div>
  )
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 border-t border-ink/10 py-14 first:border-t-0 first:pt-0 lg:scroll-mt-28"
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-heading text-3xl text-ink">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 bg-ivory p-5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/45">
        {label}
      </dt>
      <dd className="mt-1.5 font-heading text-lg text-ink">{value}</dd>
    </div>
  )
}

function detailRows(project: PublicProjectDetail) {
  const rows: { label: string; value: string }[] = []
  const push = (label: string, value: string | null) => {
    if (value) rows.push({ label, value })
  }
  push("Starting Price", formatPriceShort(project.startingPrice))
  push("Payment Plan", formatPaymentPlanShort(project.paymentPlan))
  push(
    "Property Types",
    project.propertyTypes.length ? formatPropertyTypes(project.propertyTypes) : null
  )
  push("Developer", project.developer)
  push("Status", formatProjectStatus(project.status))
  push("Handover", formatHandoverQuarter(project.handoverDate))
  push("Size Range", formatSizeRange(project.sizeRange))
  push(
    "Bedrooms",
    project.bedrooms.length ? formatBedroomsList(project.bedrooms) : null
  )
  push("Location", [project.area, project.city].filter(Boolean).join(", "))
  return rows
}

// Generic market context, mirrored across all project pages (the same way
// portals like offplan-dubai present it) — deliberately not project-specific
// figures or personal financial advice.
const investmentStats = [
  { value: "6–8%", label: "Typical Dubai rental yields" },
  { value: "10–15%", label: "Potential price growth by handover" },
  { value: "AED 2M+", label: "Golden Visa eligibility threshold" },
]

const investmentPoints = [
  "Dubai off-plan property continues to attract strong local and international demand.",
  "Staged payment plans mean capital is deployed gradually rather than up front.",
  "High-demand communities have historically seen meaningful appreciation between launch and handover.",
  "Property purchases of AED 2 million or more may qualify the owner to apply for a 10-year UAE Golden Visa, subject to regulations.",
]

function faqs(project: PublicProjectDetail) {
  const handover = formatHandoverYear(project.handoverDate)
  const plan = formatPaymentPlanShort(project.paymentPlan)
  return [
    {
      question: "What does buying off-plan mean?",
      answer:
        "You purchase directly from the developer before the project is complete — typically at a lower entry price than a ready unit, with the cost split into instalments across construction.",
    },
    {
      question: `How does the payment plan for ${project.name} work?`,
      answer: plan
        ? `${project.name} follows a ${plan} structure: a booking amount and staged instalments during construction, with the balance due around handover${handover ? ` (expected ${handover})` : ""}. Our advisors will share the exact schedule.`
        : "Payment plans split the purchase price into a booking amount, staged instalments during construction, and a balance at handover. Our advisors will share the exact schedule for this project.",
    },
    {
      question: "Can foreign nationals buy in this project?",
      answer:
        "Yes. Non-residents and foreign nationals can own freehold property in Dubai's designated freehold areas with 100% ownership and no residency requirement.",
    },
    {
      question: "Does this purchase qualify for a UAE Golden Visa?",
      answer:
        "Property investments of AED 2 million or more typically make the owner eligible to apply for a 10-year renewable Golden Visa, subject to prevailing regulations. We can guide you through the process.",
    },
    {
      question: "What fees should I budget for?",
      answer:
        "Our advisory service is free for buyers — we're compensated by the developer. You pay the standard purchase costs, principally the 4% Dubai Land Department registration fee.",
    },
    {
      question: "Can I get a mortgage as a non-resident?",
      answer:
        "Yes. UAE banks finance both residents and non-residents, generally covering 50–80% of the property value depending on your status. We can connect you with mortgage advisors.",
    },
  ]
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getPublishedProject(slug)
  if (!project) notFound()

  const otherProjects = await getOtherPublishedProjects(project.id)
  const gallery = project.gallery.slice(0, 6)
  const startingPrice = formatPriceShort(project.startingPrice)
  const handoverYear = formatHandoverYear(project.handoverDate)
  const paymentPlanShort = formatPaymentPlanShort(project.paymentPlan)

  const overview =
    project.description ??
    `${project.name} is a ${formatProjectStatus(project.status).toLowerCase()} development by ${project.developer} in ${project.area}${project.city ? `, ${project.city}` : ""}. ` +
      `The project offers ${project.propertyTypes.length ? formatPropertyTypes(project.propertyTypes).toLowerCase() : "residences"}${project.bedrooms.length ? ` with ${formatBedroomsList(project.bedrooms)} bedrooms` : ""}${startingPrice ? `, with prices starting from ${startingPrice}` : ""}${handoverYear ? ` and handover expected in ${handoverYear}` : ""}. ` +
      "Register your interest and our advisors will share the full project details, current availability, and launch pricing."

  const sections: SectionLink[] = [
    { id: "overview", label: "Overview" },
    ...(project.sellingPoints.length
      ? [{ id: "highlights", label: "Highlights" }]
      : []),
    { id: "details", label: "Details" },
    ...(gallery.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(project.amenities.length ? [{ id: "amenities", label: "Amenities" }] : []),
    ...(project.paymentMilestones.length || project.paymentPlan
      ? [{ id: "payment-plan", label: "Payment Plan" }]
      : []),
    ...(project.unitTypes.length ? [{ id: "floor-plan", label: "Floor Plan" }] : []),
    { id: "location", label: "Location" },
    { id: "investment", label: "Investment" },
    { id: "developer", label: "Developer" },
    { id: "faq", label: "FAQ" },
  ]

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-ink-deep pt-20 text-white">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink-deep/95 via-ink-deep/45 to-ink-deep/20"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-24 lg:px-10">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <Link href="/projects" className="transition-colors hover:text-white">
                Projects
              </Link>
              <span aria-hidden>/</span>
              {formatProjectStatus(project.status)}
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-[1.08] text-balance sm:text-6xl">
              {project.name}
            </h1>
            <p className="mt-3 text-lg text-white/75">by {project.developer}</p>

            <div className="mt-10 flex flex-wrap gap-x-14 gap-y-6">
              {startingPrice ? (
                <HeroStat label="Starting Price" value={startingPrice} />
              ) : null}
              {paymentPlanShort ? (
                <HeroStat label="Payment Plan" value={paymentPlanShort} />
              ) : null}
              {handoverYear ? (
                <HeroStat label="Handover" value={handoverYear} />
              ) : null}
              <HeroStat
                label="Location"
                value={[project.area, project.city].filter(Boolean).join(", ")}
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              {project.hasBrochure ? (
                <LeadGateDialog
                  projectId={project.id}
                  projectName={project.name}
                  leadType="BROCHURE"
                  triggerClassName={primaryCta}
                >
                  <Download className="size-4" aria-hidden />
                  Download Brochure
                </LeadGateDialog>
              ) : null}
              <LeadGateDialog
                projectId={project.id}
                projectName={project.name}
                leadType="ENQUIRY"
                triggerClassName={project.hasBrochure ? heroSecondaryCta : primaryCta}
              >
                Request a Callback
                <ArrowRight className="size-4" aria-hidden />
              </LeadGateDialog>
            </div>
          </div>
        </section>

        {/* Railed content: sticky section nav + sections */}
        <div className="bg-white py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[13rem_1fr] lg:gap-12 lg:px-10">
            <SectionNav sections={sections} />

            <div className="min-w-0">
              <Section id="overview" eyebrow="Overview" title="The project at a glance.">
                <div className="max-w-3xl text-[15px]/7 text-ink/70">
                  {overview.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index} className={index > 0 ? "mt-5" : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Section>

              {project.sellingPoints.length ? (
                <Section
                  id="highlights"
                  eyebrow="Highlights"
                  title="Why buyers love this project."
                >
                  <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                    {project.sellingPoints.map((point) => (
                      <li key={point} className="flex gap-3.5">
                        <span
                          className="mt-0.5 flex size-6 shrink-0 items-center justify-center bg-copper/10 text-copper"
                          aria-hidden
                        >
                          <Check className="size-3.5" />
                        </span>
                        <p className="text-[15px]/7 text-ink/75">{point}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              ) : null}

              <Section id="details" eyebrow="Project Details" title="Key facts & figures.">
                <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {detailRows(project).map((row) => (
                    <DetailTile key={row.label} label={row.label} value={row.value} />
                  ))}
                </dl>
                {project.hasBrochure ? (
                  <LeadGateDialog
                    projectId={project.id}
                    projectName={project.name}
                    leadType="BROCHURE"
                    triggerClassName={`${primaryCta} mt-8`}
                  >
                    <Download className="size-4" aria-hidden />
                    Download Project Brochure
                  </LeadGateDialog>
                ) : null}
              </Section>

              {gallery.length ? (
                <Section id="gallery" eyebrow="Gallery" title="A closer look.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gallery.map((url) => (
                      <div
                        key={url}
                        className="relative aspect-[4/3] overflow-hidden bg-ink/5"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 40vw"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {project.amenities.length ? (
                <Section
                  id="amenities"
                  eyebrow="Amenities"
                  title="Designed around everyday life."
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {project.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 border border-ink/10 bg-ivory p-5"
                      >
                        <Sparkles className="size-4 shrink-0 text-copper" aria-hidden />
                        <p className="text-sm text-ink/75">{amenity}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {project.paymentMilestones.length || project.paymentPlan ? (
                <Section
                  id="payment-plan"
                  eyebrow="Payment Plan"
                  title={
                    paymentPlanShort
                      ? `A flexible ${paymentPlanShort} payment plan.`
                      : "A flexible payment plan."
                  }
                >
                  {project.paymentMilestones.length ? (
                    <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {project.paymentMilestones.map((milestone, index) => (
                        <li
                          key={`${milestone.label}-${index}`}
                          className="border border-ink/10 bg-ivory p-5"
                        >
                          <p className="font-heading text-3xl text-copper">
                            {milestone.percentage}%
                          </p>
                          <p className="mt-2 text-sm text-ink/75">{milestone.label}</p>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  <p className="mt-8 max-w-2xl text-sm/6 text-ink/55">
                    Exact instalment schedules and any post-handover options are
                    shared by our advisors.
                    {project.hasPriceList
                      ? " Request the latest price list for unit-by-unit availability."
                      : ""}
                  </p>
                  {project.hasPriceList ? (
                    <LeadGateDialog
                      projectId={project.id}
                      projectName={project.name}
                      leadType="PRICE_LIST"
                      triggerClassName={`${primaryCta} mt-8`}
                    >
                      Get Price List
                      <ArrowRight className="size-4" aria-hidden />
                    </LeadGateDialog>
                  ) : null}
                </Section>
              ) : null}

              {project.unitTypes.length ? (
                <Section id="floor-plan" eyebrow="Floor Plan" title="Explore the residences.">
                  <div className="flex flex-col divide-y divide-ink/10 border border-ink/10">
                    {project.unitTypes.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h3 className="font-heading text-xl text-ink">{unit.name}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-ink/55">
                            {unit.sizeRange ? (
                              <span className="flex items-center gap-1.5">
                                <Ruler className="size-3.5 text-copper" aria-hidden />
                                {formatSizeRange(unit.sizeRange)}
                              </span>
                            ) : null}
                            <span className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-copper" aria-hidden />
                              Starting from{" "}
                              {formatPriceShort(unit.startingPrice) ?? "price on request"}
                            </span>
                          </div>
                        </div>
                        <LeadGateDialog
                          projectId={project.id}
                          projectName={project.name}
                          leadType={project.hasFloorPlans ? "FLOOR_PLAN" : "ENQUIRY"}
                          triggerClassName={outlineCta}
                        >
                          {project.hasFloorPlans ? "Get Floor Plans" : "Enquire"}
                          <ArrowRight className="size-3.5" aria-hidden />
                        </LeadGateDialog>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section id="location" eyebrow="Location" title="Where you'll call home.">
                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-1 size-5 shrink-0 text-copper" aria-hidden />
                  <div>
                    <p className="font-heading text-xl text-ink">{project.location}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      {[project.community, project.masterCommunity, project.city]
                        .filter(Boolean)
                        .filter((value, index, list) => list.indexOf(value) === index)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                {handoverYear ? (
                  <div className="mt-6 flex items-start gap-3.5">
                    <CalendarClock
                      className="mt-1 size-5 shrink-0 text-copper"
                      aria-hidden
                    />
                    <div>
                      <p className="font-heading text-xl text-ink">
                        Handover {formatHandoverQuarter(project.handoverDate)}
                      </p>
                      <p className="mt-1 text-sm text-ink/55">
                        {formatProjectStatus(project.status)} development
                      </p>
                    </div>
                  </div>
                ) : null}
              </Section>

              <Section
                id="investment"
                eyebrow="Investment"
                title="Why investors look at Dubai off-plan."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  {investmentStats.map((stat) => (
                    <div key={stat.label} className="border border-ink/10 bg-ivory p-5">
                      <p className="font-heading text-3xl text-copper">{stat.value}</p>
                      <p className="mt-2 text-sm text-ink/70">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <ul className="mt-8 flex max-w-2xl flex-col gap-3">
                  {investmentPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <TrendingUp
                        className="mt-1 size-4 shrink-0 text-copper"
                        aria-hidden
                      />
                      <p className="text-sm/6 text-ink/70">{point}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-2xl text-xs/5 text-ink/45">
                  Market figures are indicative of the wider Dubai market, vary by
                  community and unit, and are not a guarantee of returns or
                  financial advice.
                </p>
                <LeadGateDialog
                  projectId={project.id}
                  projectName={project.name}
                  leadType="ENQUIRY"
                  triggerClassName={`${primaryCta} mt-8`}
                >
                  Speak to an Advisor
                  <ArrowRight className="size-4" aria-hidden />
                </LeadGateDialog>
              </Section>

              <Section
                id="developer"
                eyebrow="Developer"
                title={`About ${project.developer}.`}
              >
                <p className="max-w-2xl text-[15px]/7 text-ink/70">
                  {project.name} is developed by {project.developer}
                  {project.brandedResidence && project.brandName
                    ? ` in partnership with ${project.brandName}`
                    : ""}
                  . Trixis Homes works directly with the developer, which means
                  first-look inventory, launch pricing, and a booking process
                  handled end-to-end by our advisors — at no fee to you.
                </p>
                <LeadGateDialog
                  projectId={project.id}
                  projectName={project.name}
                  leadType="ENQUIRY"
                  triggerClassName={`${outlineCta} mt-8`}
                >
                  Ask About {project.developer}
                  <ArrowRight className="size-3.5" aria-hidden />
                </LeadGateDialog>
              </Section>

              <Section id="faq" eyebrow="FAQ" title="Frequently asked questions.">
                <div className="flex flex-col divide-y divide-ink/10 border border-ink/10">
                  {faqs(project).map((faq) => (
                    <details key={faq.question} className="group">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-heading text-lg text-ink transition-colors hover:text-copper [&::-webkit-details-marker]:hidden">
                        {faq.question}
                        <span
                          className="text-copper transition-transform group-open:rotate-45"
                          aria-hidden
                        >
                          +
                        </span>
                      </summary>
                      <p className="px-5 pb-5 text-sm/6 text-ink/70">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>

        {/* Enquiry */}
        <section id="enquire" className="scroll-mt-20 bg-ink-deep py-20 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-10">
            <div>
              <Eyebrow>Request a Callback</Eyebrow>
              <h2 className="mt-5 font-heading text-3xl leading-[1.15] text-white sm:text-4xl">
                Get early access to {project.name}.
              </h2>
              <p className="mt-6 max-w-md text-sm/6 text-white/65">
                Leave your name and number and one of our advisors will call you
                back with floor plans, current availability, and launch pricing
                — before it goes public.
              </p>
            </div>
            <div className="bg-white p-8">
              <LeadForm
                projectId={project.id}
                leadType="ENQUIRY"
                submitLabel="Request a Callback"
              />
            </div>
          </div>
        </section>

        {/* More projects */}
        {otherProjects.length ? (
          <section className="bg-ivory py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>Keep Exploring</Eyebrow>
                  <h2 className="mt-4 font-heading text-3xl text-ink sm:text-4xl">
                    More projects we work on.
                  </h2>
                </div>
                <Link
                  href="/projects"
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper transition-colors hover:text-copper-deep"
                >
                  View All Projects
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {otherProjects.map((other) => (
                  <ProjectCard key={other.id} project={other} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
