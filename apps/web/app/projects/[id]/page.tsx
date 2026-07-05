import { notFound } from "next/navigation"

import { AttachmentsPanel } from "@/components/projects/attachments/attachments-panel"
import { GeneralInfoPanel } from "@/components/projects/general-info-panel"
import { NotesPanel } from "@/components/projects/notes/notes-panel"
import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectTabs } from "@/components/projects/project-tabs"
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
    <div className="flex flex-col gap-6">
      <ProjectHeader project={project} />
      <ProjectTabs
        general={<GeneralInfoPanel project={project} />}
        unitTypes={
          <UnitTypeTable projectId={project.id} unitTypes={project.unitTypes} />
        }
        notes={<NotesPanel projectId={project.id} notes={project.notes} />}
        attachments={
          <AttachmentsPanel
            projectId={project.id}
            attachments={project.attachments}
          />
        }
      />
    </div>
  )
}
