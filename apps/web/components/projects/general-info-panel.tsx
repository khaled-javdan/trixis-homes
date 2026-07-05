import { formatDate } from "@/lib/format"
import type { PlainProject } from "@/lib/data/serialize"

export function GeneralInfoPanel({ project }: { project: PlainProject }) {
  const fields: Array<[string, string | null]> = [
    ["Project Name", project.name],
    ["Developer", project.developer],
    ["Community", project.community],
    ["Location", project.location],
    ["Handover Date", formatDate(project.handoverDate)],
    ["Payment Plan", project.paymentPlan],
  ]

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {project.description && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Description</p>
          <p className="text-sm whitespace-pre-wrap">{project.description}</p>
        </div>
      )}
    </div>
  )
}
