import Image from "next/image"
import Link from "next/link"
import { PlusIcon, SparklesIcon } from "lucide-react"

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
        <Link href="/" className="flex shrink-0 items-center">
          <span className="flex h-10 items-center rounded-md bg-white px-2 py-1.5">
            <Image
              src="/logo.svg"
              alt="Trixis Homes"
              width={105}
              height={74}
              priority
              className="h-full w-auto"
            />
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
