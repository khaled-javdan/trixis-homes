import { redirect } from "next/navigation"

import { prisma } from "@workspace/db"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { InviteMemberDialog } from "@/components/members/invite-member-dialog"
import { MemberRowActions } from "@/components/members/member-row-actions"
import { UserAvatar } from "@/components/user-avatar"
import { getSession } from "@/lib/auth"
import { formatDateShort } from "@/lib/format"

const statusBadge = {
  ACTIVE: { label: "Active", variant: "outline" as const },
  INVITED: { label: "Invited", variant: "secondary" as const },
  DISABLED: { label: "Disabled", variant: "destructive" as const },
}

export default async function MembersPage() {
  const session = await getSession()
  if (!session) redirect("/login?next=/members")
  if (session.role !== "OWNER") redirect("/")

  const members = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People who can sign in to the admin app. Owners can manage members;
            members can use everything else.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={member.name}
                      email={member.email}
                      avatarUrl={member.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="font-medium">
                        {member.name ?? "—"}
                        {member.id === session.userId ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </div>
                      {member.title ? (
                        <div className="text-xs text-muted-foreground">
                          {member.title}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div>{member.email}</div>
                  {member.phone ? (
                    <div className="text-xs">{member.phone}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === "OWNER" ? "default" : "secondary"}
                  >
                    {member.role === "OWNER" ? "Owner" : "Member"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge[member.status].variant}>
                    {statusBadge[member.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.lastLoginAt
                    ? formatDateShort(member.lastLoginAt.toISOString())
                    : "Never"}
                </TableCell>
                <TableCell>
                  <MemberRowActions
                    userId={member.id}
                    name={member.name ?? member.email}
                    role={member.role}
                    status={member.status}
                    isSelf={member.id === session.userId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
