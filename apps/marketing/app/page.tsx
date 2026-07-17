import { About } from "@/components/about"
import { Cta } from "@/components/cta"
import { Hero } from "@/components/hero"
import { FeaturedProjects } from "@/components/projects/featured-projects"
import { HotProjectsSlider } from "@/components/projects/hot-projects-slider"
import { Properties } from "@/components/properties"
import { Reviews } from "@/components/reviews"
import { Services } from "@/components/services"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Team } from "@/components/team"
import { Ticker } from "@/components/ticker"
import { googleRating, reviews, site } from "@/lib/content"
import { getHotProjects } from "@/lib/projects"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: site.legalName,
  url: "https://trixishomes.com",
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "108, Falcon House, DIP 1",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: googleRating.score,
    reviewCount: googleRating.count,
    bestRating: "5",
  },
  review: reviews.map((review) => ({
    "@type": "Review",
    author: { "@type": "Person", name: review.name },
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    reviewBody: review.text,
  })),
}

// The featured-projects section reads the database (projects are published
// from the admin app), so the home page renders per-request.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const hotProjects = await getHotProjects()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <HotProjectsSlider projects={hotProjects} />
        <FeaturedProjects />
        <Ticker />
        <Services />
        <Properties />
        <About />
        <Team />
        <Reviews />
        <Cta />
      </main>
      <SiteFooter />
    </>
  )
}
