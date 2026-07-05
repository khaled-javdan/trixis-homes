"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@workspace/ui/components/skeleton"

import type { ProjectLocationPickerProps } from "@/components/projects/project-location-picker-inner"

const ProjectLocationPickerInner = dynamic(
  () => import("@/components/projects/project-location-picker-inner"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[32rem] w-full rounded-lg" />,
  }
)

export function ProjectLocationPicker(props: ProjectLocationPickerProps) {
  return <ProjectLocationPickerInner {...props} />
}
