import { redirect } from "next/navigation"

import { isAdmin } from "@/lib/auth"

// The root is a role-based router: owners land on Analytics (their primary
// admin screen), while members (viewers) land on the projects catalog. Both
// remain reachable from the sidebar.
export default async function HomePage() {
  redirect((await isAdmin()) ? "/analytics" : "/projects")
}
