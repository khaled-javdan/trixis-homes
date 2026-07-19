import { redirect } from "next/navigation"

import { isAdmin } from "@/lib/auth"
import { NewProjectCard } from "./new-project-card"

export default async function NewProjectPage() {
  if (!(await isAdmin())) {
    redirect("/")
  }

  return <NewProjectCard />
}
