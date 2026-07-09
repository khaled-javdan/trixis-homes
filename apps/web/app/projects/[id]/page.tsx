import { notFound } from "next/navigation"

import { AttachmentsPanel } from "@/components/projects/attachments/attachments-panel"
import { GeneralInfoPanel } from "@/components/projects/general-info-panel"
import { NotesPanel } from "@/components/projects/notes/notes-panel"
import { PaymentMilestonesPanel } from "@/components/projects/payment-milestones/payment-milestones-panel"
import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectLocationPicker } from "@/components/projects/project-location-picker"
import { ProjectMap } from "@/components/projects/project-map"
import { UnitTypeTable } from "@/components/projects/unit-types/unit-type-table"
import { getProjectDetail } from "@/lib/data/projects"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <ProjectHeader project={project} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">General Info</h2>
        <GeneralInfoPanel project={project} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Payment Plan</h2>
        <PaymentMilestonesPanel
          projectId={project.id}
          milestones={project.paymentMilestones}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Location</h2>
        {project.latitude != null && project.longitude != null ? (
          <ProjectMap
            projectId={project.id}
            name={project.name}
            location={project.location}
            latitude={project.latitude}
            longitude={project.longitude}
          />
        ) : (
          <ProjectLocationPicker projectId={project.id} />
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Unit Types</h2>
        <UnitTypeTable projectId={project.id} unitTypes={project.unitTypes} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Notes</h2>
        <NotesPanel projectId={project.id} notes={project.notes} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Attachments</h2>
        <AttachmentsPanel
          projectId={project.id}
          attachments={project.attachments}
        />
      </section>
    </div>
  )
}
