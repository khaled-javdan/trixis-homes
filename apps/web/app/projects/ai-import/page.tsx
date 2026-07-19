import { redirect } from "next/navigation"

import { AiImportFlow } from "@/components/projects/ai-import/ai-import-flow"
import { isAdmin } from "@/lib/auth"

export default async function AiImportPage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Paste to Create
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste broker notes or a price list and let AI turn it into projects
          and unit types — review and edit before creating.
        </p>
      </div>
      <AiImportFlow />
    </div>
  )
}
