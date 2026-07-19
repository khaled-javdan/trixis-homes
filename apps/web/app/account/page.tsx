import { redirect } from "next/navigation"

import { prisma } from "@workspace/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { ChangePasswordForm } from "@/components/account/change-password-form"
import { ProfileForm } from "@/components/account/profile-form"
import { getSession } from "@/lib/auth"

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect("/login?next=/account")

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect("/login")

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.email} · {user.role === "OWNER" ? "Owner" : "Member"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>
            Your photo and details, shown to other members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={{
              name: user.name ?? "",
              title: user.title ?? "",
              phone: user.phone ?? "",
              avatarUrl: user.avatarUrl ?? "",
            }}
            email={user.email}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
