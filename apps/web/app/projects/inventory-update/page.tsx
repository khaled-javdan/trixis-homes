import { redirect } from "next/navigation"

import { InventoryUpdateFlow } from "@/components/projects/inventory-update/inventory-update-flow"
import { isAdmin } from "@/lib/auth"
import { getProjectMatchOptions } from "@/lib/data/projects"

export default async function InventoryUpdatePage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const projectOptions = await getProjectMatchOptions()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Inventory Update
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a developer availability sheet or upload a screenshot — AI
          extracts the changes, matches them to existing projects, and shows a
          diff to review before anything is saved.
        </p>
      </div>
      <InventoryUpdateFlow projectOptions={projectOptions} />
    </div>
  )
}
