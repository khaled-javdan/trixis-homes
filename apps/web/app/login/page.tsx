import { redirect } from "next/navigation"

import { isAdmin } from "@/lib/auth"
import { LoginForm } from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  if (await isAdmin()) {
    redirect(next && next.startsWith("/") ? next : "/")
  }

  return <LoginForm next={next} />
}
