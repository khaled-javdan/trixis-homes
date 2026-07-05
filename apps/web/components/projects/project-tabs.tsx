"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

const TABS = [
  { value: "general", label: "General Info" },
  { value: "unit-types", label: "Unit Types" },
  { value: "notes", label: "Notes" },
  { value: "attachments", label: "Attachments" },
] as const

export function ProjectTabs({
  general,
  unitTypes,
  notes,
  attachments,
}: {
  general: React.ReactNode
  unitTypes: React.ReactNode
  notes: React.ReactNode
  attachments: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") ?? "general"

  function onTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(String(value))}
    >
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="general" className="pt-4">
        {general}
      </TabsContent>
      <TabsContent value="unit-types" className="pt-4">
        {unitTypes}
      </TabsContent>
      <TabsContent value="notes" className="pt-4">
        {notes}
      </TabsContent>
      <TabsContent value="attachments" className="pt-4">
        {attachments}
      </TabsContent>
    </Tabs>
  )
}
