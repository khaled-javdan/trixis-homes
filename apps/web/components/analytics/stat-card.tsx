import { Card, CardContent } from "@workspace/ui/components/card"

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </CardContent>
    </Card>
  )
}
