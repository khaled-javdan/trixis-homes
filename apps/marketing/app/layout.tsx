import type { Metadata } from "next"
import { Inter, Marcellus } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { cn } from "@workspace/ui/lib/utils"

import { AdminBar } from "@/components/admin-bar"
import { WhatsAppFloat } from "@/components/whatsapp-float"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://trixishomes.com"),
  title: "Trixis Homes — Dubai Real Estate | Buy, Sell, Rent & Invest",
  description:
    "From luxury homes in Dubai to investments worldwide, Trixis Homes delivers seamless, end-to-end property solutions backed by trust and expertise.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Trixis Homes — Dubai Real Estate",
    description:
      "Buy, sell, invest, or rent with confidence. End-to-end property solutions in Dubai and worldwide.",
    url: "https://trixishomes.com",
    siteName: "Trixis Homes",
    images: [{ url: "/images/hero-marina.jpg" }],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased font-sans", inter.variable, marcellus.variable)}
    >
      <body>
        {children}
        <WhatsAppFloat />
        <AdminBar />
        <Analytics />
      </body>
    </html>
  )
}
