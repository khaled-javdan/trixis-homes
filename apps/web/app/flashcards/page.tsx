import { FlashcardSession } from "@/components/study/flashcard-session"
import { ProjectPicker } from "@/components/study/project-picker"
import {
  getProjectPickerOptions,
  getProjectsForStudyMode,
} from "@/lib/data/study"
import { generateFlashcardsForProjects } from "@/lib/study/flashcards"

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>
}) {
  const { projectId } = await searchParams
  const [projects, pickerOptions] = await Promise.all([
    getProjectsForStudyMode(projectId),
    getProjectPickerOptions(),
  ])
  const cards = generateFlashcardsForProjects(projects)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">
            Click a card to flip between the project name and its details.
          </p>
        </div>
        <ProjectPicker projects={pickerOptions} />
      </div>
      <FlashcardSession cards={cards} />
    </div>
  )
}
