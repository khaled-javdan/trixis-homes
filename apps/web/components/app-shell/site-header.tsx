import Link from "next/link"
import { Building2Icon, PlusIcon, SparklesIcon } from "lucide-react"

import { ButtonLink } from "@/components/button-link"
import { getProjectPickerOptions } from "@/lib/data/study"
import { CommandPalette } from "./command-palette"
import { MainNav } from "./main-nav"
import { ThemeToggle } from "./theme-toggle"

export async function SiteHeader() {
  const projects = await getProjectPickerOptions()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2Icon className="size-4.5" />
          </span>
          <span className="hidden font-semibold tracking-tight sm:inline">
            Trixis Homes
          </span>
        </Link>

        <MainNav />

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="w-full max-w-56">
            <CommandPalette projects={projects} />
          </div>
          <ButtonLink
            href="/projects/ai-import"
            variant="outline"
            size="sm"
            className="max-sm:size-8 max-sm:px-0"
          >
            <SparklesIcon />
            <span className="max-sm:hidden">Paste to Create</span>
          </ButtonLink>
          <ButtonLink
            href="/projects/new"
            size="sm"
            className="max-sm:size-8 max-sm:px-0"
          >
            <PlusIcon />
            <span className="max-sm:hidden">New Project</span>
          </ButtonLink>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
