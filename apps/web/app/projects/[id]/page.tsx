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

const panelClass =
  "flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:p-6"
const headingClass = "text-lg font-semibold tracking-tight"

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
    <div className="flex flex-col gap-6">
      <ProjectHeader project={project} />

      {/* Top row: key facts alongside the map for an at-a-glance overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${panelClass} lg:col-span-2`}>
          <h2 className={headingClass}>General Info</h2>
          <GeneralInfoPanel project={project} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className={headingClass}>Location</h2>
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
      </div>

      {/* Unit types: a wide table, kept full width */}
      <section className={panelClass}>
        <h2 className={headingClass}>Unit Types</h2>
        <UnitTypeTable project={project} />
      </section>

      {/* Payment plan alongside notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${panelClass} lg:col-span-2`}>
          <h2 className={headingClass}>Payment Plan</h2>
          <PaymentMilestonesPanel
            projectId={project.id}
            handoverDate={project.handoverDate}
            milestones={project.paymentMilestones}
          />
        </section>

        <section className={panelClass}>
          <h2 className={headingClass}>Notes</h2>
          <NotesPanel projectId={project.id} notes={project.notes} />
        </section>
      </div>

      <section className={panelClass}>
        <h2 className={headingClass}>Attachments</h2>
        <AttachmentsPanel
          projectId={project.id}
          attachments={project.attachments}
        />
      </section>
    </div>
  )
}
