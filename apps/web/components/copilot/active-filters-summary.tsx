import { Badge } from "@workspace/ui/components/badge"

export function ActiveFiltersSummary({
  chips,
  projectCount,
}: {
  chips: string[]
  projectCount: number
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-sm text-muted-foreground">
        The copilot can only see the{" "}
        <span className="font-medium text-foreground">
          {projectCount} project{projectCount === 1 ? "" : "s"}
        </span>{" "}
        matching your current filters:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.length === 0 ? (
          <Badge variant="secondary">No filters applied — all projects</Badge>
        ) : (
          chips.map((chip) => (
            <Badge key={chip} variant="secondary">
              {chip}
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
