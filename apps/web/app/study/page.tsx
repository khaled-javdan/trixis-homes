import { ProjectPicker } from "@/components/study/project-picker"
import { StudySession } from "@/components/study/study-session"
import {
  getProjectPickerOptions,
  getProjectsForStudyMode,
} from "@/lib/data/study"
import { generateQuestionsForProjects } from "@/lib/study/generate-questions"

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>
}) {
  const { projectId } = await searchParams
  const [projects, pickerOptions] = await Promise.all([
    getProjectsForStudyMode(projectId),
    getProjectPickerOptions(),
  ])
  const questions = generateQuestionsForProjects(projects)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Memory Mode</h1>
          <p className="text-sm text-muted-foreground">
            Test yourself on project details — click &ldquo;Show Answer&rdquo;
            once you&apos;ve made your guess.
          </p>
        </div>
        <ProjectPicker projects={pickerOptions} />
      </div>
      <StudySession questions={questions} />
    </div>
  )
}
