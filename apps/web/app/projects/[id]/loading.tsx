import { Skeleton } from "@workspace/ui/components/skeleton"

export default function ProjectDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
