"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@workspace/ui/components/skeleton"

import type { ProjectMapProps } from "@/components/projects/project-map-inner"

const ProjectMapInner = dynamic(
  () => import("@/components/projects/project-map-inner"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[32rem] w-full rounded-lg" />,
  }
)

export function ProjectMap(props: ProjectMapProps) {
  return <ProjectMapInner {...props} />
}
