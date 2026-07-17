export const site = {
  name: "Trixis Homes",
  legalName: "Trixis Homes Real Estate LLC",
  address: "108, Falcon House, DIP 1, Dubai, United Arab Emirates",
  phone: "+971 4 296 9303",
  phoneHref: "tel:+97142969303",
  email: "contact@trixishomes.com",
  whatsapp:
    "https://wa.me/971524921237?text=Hi%20Trixis%20Homes%2C%20I'm%20interested%20in%20your%20services",
  instagram: "https://www.instagram.com/trixishomes",
  linkedin: "https://www.linkedin.com/company/trixishomes/",
  // The property-search app. Override locally with NEXT_PUBLIC_APP_URL
  // (e.g. http://localhost:3000); defaults to production.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.trixishomes.com",
}

// Anchor links are prefixed with "/" so they work from subpages
// (e.g. /projects) as well as the home page.
export const nav = [
  { label: "Projects", href: "/projects" },
  { label: "Developers", href: "/developers" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Team", href: "/#team" },
  { label: "Contact", href: "/#contact" },
]

export const stats = [
  { value: "5K+", label: "Properties Sold & Rented" },
  { value: "5K+", label: "Happy Clients" },
  { value: "90%", label: "Client Retention Rate" },
  { value: "$3B+", label: "Project Value" },
]

export const services = [
  {
    title: "Buy & Sell",
    description:
      "End-to-end sales and acquisitions — valuation, marketing, negotiation, and transfer, handled by experts who know every corner of the Dubai market.",
  },
  {
    title: "Off-Plan Properties",
    description:
      "First access to Dubai's most sought-after launches, with clear guidance on developers, payment plans, and handover timelines.",
  },
  {
    title: "International Properties",
    description:
      "A curated portfolio of investment opportunities beyond the UAE, sourced through our global partner network.",
  },
  {
    title: "Commercial Real Estate",
    description:
      "Offices, retail, and hospitality assets matched to your business strategy and yield targets.",
  },
  {
    title: "Luxury Homes",
    description:
      "Signature villas and penthouses in Dubai's most exclusive communities — presented with the discretion they deserve.",
  },
  {
    title: "Rentals",
    description:
      "Seamless leasing for landlords and tenants alike, from listing and screening to move-in day.",
  },
]

export const communities = [
  "Palm Jumeirah",
  "Downtown Dubai",
  "Dubai Marina",
  "Emirates Hills",
  "Business Bay",
  "Dubai Hills Estate",
  "Jumeirah Golf Estates",
  "Palm Jebel Ali",
]

// Official brand logos sourced from each developer's site (or Wikipedia
// for DAMAC/Sobha/Aldar). All are normalized to a single tone in CSS.
// Write-ups live in the Developer table (seeded by packages/db/prisma/seed-developers.ts).
export const developers = [
  { name: "Emaar", logo: "/images/developers/emaar.svg" },
  { name: "Aldar", logo: "/images/developers/aldar.png" },
  { name: "Sobha", logo: "/images/developers/sobha.png" },
  { name: "Damac", logo: "/images/developers/damac.png" },
  { name: "Nakheel", logo: "/images/developers/nakheel.svg" },
  { name: "Dubai South", logo: "/images/developers/dubai-south.svg" },
  { name: "WASL", logo: "/images/developers/wasl.png" },
  { name: "EXPO City", logo: "/images/developers/expo-city.png" },
  { name: "Arada", logo: "/images/developers/arada.svg" },
  { name: "Danube", logo: "/images/developers/danube.png" },
  { name: "Binghatti", logo: "/images/developers/binghatti.svg" },
  { name: "Azizi", logo: "/images/developers/azizi.svg" },
  { name: "Majid Al Futtaim", logo: "/images/developers/majid-al-futtaim.png" },
  { name: "Deyaar", logo: "/images/developers/deyaar.svg" },
  { name: "Bloom", logo: "/images/developers/bloom.svg" },
  { name: "Dar Global", logo: "/images/developers/dar-global.png" },
  { name: "Samana", logo: "/images/developers/samana.png" },
  { name: "Nshama", logo: "/images/developers/nshama.svg" },
  { name: "Beyond", logo: "/images/developers/beyond.webp" },
  { name: "Reportage", logo: "/images/developers/reportage.svg" },
  { name: "Imtiaz", logo: "/images/developers/imtiaz.svg" },
  { name: "Omniyat", logo: "/images/developers/omniyat.svg" },
]

export const mission = [
  "Putting the client first in every transaction",
  "Ensuring professionalism at every stage",
  "Creating a smooth, transparent process from inquiry to closing",
  "Listening to reviews and feedback to continually improve",
  "Offering in-depth market expertise to guide decisions",
]

export const team = [
  {
    name: "Ketan Satish",
    role: "Founder & CEO",
    email: "ketan@trixishomes.com",
    image: "/images/team/ketan.jpg" as string | null,
  },
  {
    name: "Ayan",
    role: "Associate Vice President",
    email: "ayan@trixishomes.com",
    image: null,
  },
  {
    name: "Rithvik Aswin",
    role: "Principal Partner",
    email: "rithvik@trixishomes.com",
    image: "/images/team/rithvik.jpg",
  },
  {
    name: "Shreyas Veerapur",
    role: "Associate Vice President",
    email: "shreyas@trixishomes.com",
    image: "/images/team/shreyas.jpg",
  },
  {
    name: "Moein",
    role: "Associate Vice President",
    email: "moein@trixishomes.com",
    image: null,
  },
  {
    name: "Deba",
    role: "Associate Vice President",
    email: "deba@trixishomes.com",
    image: null,
  },
]

// Wider sales & advisory team ("level two"). Placeholder entries for now —
// swap in real names, roles, and photos (add images to /images/team/).
export const teamLevelTwo = Array.from({ length: 10 }, (_, i) => ({
  name: `Team Member ${i + 1}`,
  role: "Property Consultant",
  email: "hello@trixishomes.com",
  image: null as string | null,
}))

export const googleRating = {
  score: "5.0",
  count: 17,
}

// Verbatim Google reviews (lightly normalized for spelling), all 5 stars.
export const reviews = [
  {
    name: "Sasha Wanchoo",
    text: "I am very satisfied with my experience with the Trixis team. Deviyadev Singh helped me a lot in my first ever villa purchase. Everything was explained in depth, and what makes them different is they are truly helping with the best ROIs and not just superficially doing their job. Highly recommend their service!",
  },
  {
    name: "Sandhya Dhariwal",
    text: "Excellent experience with Trixis Homes. The project quality, location, and overall vision gave me confidence as an investor. The team was professional, transparent, and helpful throughout the process. Looking forward to seeing the value of this investment grow. Highly recommended.",
  },
  {
    name: "Piyush Sharma",
    text: "Deviyadev provided outstanding guidance for my villa investment in Dubai. His expert advice, clear communication, and market knowledge made the entire process seamless and highly successful.",
  },
  {
    name: "Arjun Sharma",
    text: "Excellent real estate company in Dubai. Professional team, transparent dealing, and very supportive throughout the process. They provide genuine guidance and great investment opportunities. Highly recommended for buying, selling, or renting properties.",
  },
  {
    name: "Yanca Istael",
    text: "Really good company overall. Professional team, strong market knowledge, and a clear focus on quality. Definitely stands out in the real estate space.",
  },
  {
    name: "Maron Hari",
    text: "Very helpful agents. Helped me rent my property in JVC within a few days.",
  },
  {
    name: "Aritra Mukherjee",
    text: "Rayn, amazing guy out there, helped me diversify my investments. Polite and well spoken.",
  },
  {
    name: "Afsar Ahmed",
    text: "I had a great experience with Mr Debabrata — the service provided for my investment by Trixis was amazing and smooth.",
  },
  {
    name: "Amit Gupta",
    text: "Highly recommended! Excellent experience with Trixis Homes Real Estate. The team was professional.",
  },
  {
    name: "Moin Shaikhsanadi",
    text: "Thank you for making the entire buying process smooth and hassle-free. Really appreciated.",
  },
  {
    name: "Daniel Jay",
    text: "Great team! They really care about their clients. Made the property investment process very smooth. Highly recommend!",
  },
  {
    name: "Mahmoud Ghonim",
    text: "They are skilled people, professional in their dealings, and committed to their promises and agreements.",
    note: "Translated from Arabic",
  },
]
