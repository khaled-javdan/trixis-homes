"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutGridIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  SquareStackIcon,
  SunIcon,
} from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command"

import { useIsAdmin } from "@/components/admin-provider"

type CommandPaletteProject = {
  id: string
  name: string
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export function CommandPalette({
  projects,
}: {
  projects: CommandPaletteProject[]
}) {
  const isAdmin = useIsAdmin()
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
        return
      }

      if (event.key === "/" && !isTypingTarget(event.target) && !open) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  function go(path: string) {
    setOpen(false)
    router.push(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-full max-w-56 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-sm text-muted-foreground shadow-none hover:bg-muted"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[0.7rem]">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search projects or run a command…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => go(`/projects/${project.id}`)}
                >
                  <SquareStackIcon /> {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem value="Dashboard" onSelect={() => go("/")}>
                <LayoutGridIcon /> Go to Dashboard
              </CommandItem>
              {isAdmin && (
                <>
                  <CommandItem
                    value="New Project"
                    onSelect={() => go("/projects/new")}
                  >
                    <PlusIcon /> New Project
                  </CommandItem>
                  <CommandItem
                    value="Paste to Create"
                    onSelect={() => go("/projects/ai-import")}
                  >
                    <SparklesIcon /> Paste to Create
                  </CommandItem>
                </>
              )}
              <CommandItem
                value="Toggle theme"
                onSelect={() => {
                  setOpen(false)
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }}
              >
                {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />} Toggle
                theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
