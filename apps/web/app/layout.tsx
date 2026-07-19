import { headers } from "next/headers"
import { redirect } from "next/navigation"
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
import { getSession } from "@/lib/auth"
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

// Pages reachable while logged out — they render without the dashboard shell.
const PUBLIC_PATHS = ["/login", "/reset-password", "/forgot-password"]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = (await headers()).get("x-pathname") ?? ""
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  const session = await getSession()

  // Middleware blocks anonymous users from non-public paths; this also catches
  // a disabled user whose cookie is still validly signed.
  if (!session && !isPublic) {
    redirect(`/login?next=${encodeURIComponent(pathname || "/")}`)
  }

  const shellClass = cn(
    "antialiased",
    fontMono.variable,
    "font-sans",
    inter.variable
  )

  // Logged-out pages (login, reset) render on a bare, centered canvas — no
  // sidebar, no command-palette DB query.
  if (!session) {
    return (
      <html lang="en" suppressHydrationWarning className={shellClass}>
        <body>
          <ThemeProvider>
            <TooltipProvider>
              <main className="flex min-h-svh flex-col items-center justify-center px-4">
                {children}
              </main>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  const projects = await getProjectPickerOptions()

  return (
    <html lang="en" suppressHydrationWarning className={shellClass}>
      <body>
        <ThemeProvider>
          <AdminProvider isAdmin={session.role === "OWNER"}>
            <TooltipProvider>
              <SidebarProvider>
                <AppSidebar
                  admin
                  role={session.role}
                  userName={session.name}
                  userEmail={session.email}
                  avatarUrl={session.avatarUrl}
                  marketingUrl={marketingUrl}
                />
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
