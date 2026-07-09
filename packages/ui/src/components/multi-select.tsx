"use client"

import * as React from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

export type MultiSelectOption = {
  value: string
  label: string
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  className,
}: {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  // Mirror `selected` in local state so rapid sequential toggles (before the
  // parent's `onChange` round-trips back through async URL state) accumulate
  // correctly instead of each computing off a stale `selected` prop. Synced
  // during render (not an effect) since `selected` is a fresh array each
  // render — comparing by value, not reference, is what should trigger a resync.
  const selectedKey = selected.join("␟")
  const [localSelected, setLocalSelected] = React.useState(selected)
  const [syncedKey, setSyncedKey] = React.useState(selectedKey)
  if (selectedKey !== syncedKey) {
    setSyncedKey(selectedKey)
    setLocalSelected(selected)
  }

  function toggle(value: string) {
    const next = localSelected.includes(value)
      ? localSelected.filter((item) => item !== value)
      : [...localSelected, value]
    setLocalSelected(next)
    onChange(next)
  }

  const selectedLabels = options
    .filter((option) => localSelected.includes(option.value))
    .map((option) => option.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("w-full justify-between font-normal", className)}
          />
        }
      >
        <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-left">
          {selectedLabels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selectedLabels.length <= 2 ? (
            <span className="truncate">{selectedLabels.join(", ")}</span>
          ) : (
            <>
              <span className="truncate">{selectedLabels[0]}</span>
              <Badge variant="secondary">+{selectedLabels.length - 1}</Badge>
            </>
          )}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  data-checked={localSelected.includes(option.value)}
                  onSelect={() => toggle(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
