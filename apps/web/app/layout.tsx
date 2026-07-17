import { Geist_Mono, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { AdminProvider } from "@/components/admin-provider"
import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { CommandPalette } from "@/components/app-shell/command-palette"
import { ThemeToggle } from "@/components/app-shell/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { isAdmin } from "@/lib/auth"
import { getProjectPickerOptions } from "@/lib/data/projects"

// The public marketing site. Override locally with NEXT_PUBLIC_MARKETING_URL
// (e.g. http://localhost:3001); defaults to production.
const marketingUrl =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://trixishomes.com"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// The header queries the database on every request (project list for the
// command palette), so every route in this app is inherently dynamic.
export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [admin, projects] = await Promise.all([
    isAdmin(),
    getProjectPickerOptions(),
  ])

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AdminProvider isAdmin={admin}>
            <TooltipProvider>
              <SidebarProvider>
                <AppSidebar admin={admin} marketingUrl={marketingUrl} />
                {/* Fixed header: placed right after the sidebar (the CSS peer)
                    so it can offset its left edge to match the sidebar's
                    expanded / icon-collapsed width. */}
                <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm transition-[left] duration-200 ease-linear peer-data-[state=collapsed]:md:left-(--sidebar-width-icon) peer-data-[state=expanded]:md:left-(--sidebar-width) sm:px-6">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-1 data-vertical:self-center data-[orientation=vertical]:h-5"
                  />
                  <div className="w-full max-w-72">
                    <CommandPalette projects={projects} />
                  </div>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </header>
                <SidebarInset>
                  <main className="mx-auto w-full max-w-7xl px-4 pt-22 pb-6 sm:px-6">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </TooltipProvider>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
