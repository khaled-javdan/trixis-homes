"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  KeyRoundIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UserXIcon,
} from "lucide-react"
import { toast } from "sonner"

import type { UserRole, UserStatus } from "@workspace/db"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import {
  deleteMember,
  resetMemberPassword,
  setMemberRole,
  setMemberStatus,
} from "@/lib/actions/members"
import { TempPasswordBox } from "@/components/members/invite-member-dialog"

export function MemberRowActions({
  userId,
  name,
  role,
  status,
  isSelf,
}: {
  userId: string
  name: string
  role: UserRole
  status: UserStatus
  isSelf: boolean
}) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [resetPassword, setResetPassword] = React.useState<string | null>(null)

  function run(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action()
        toast.success(success)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Action failed")
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Manage ${name}`} />
          }
        >
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {role === "MEMBER" ? (
            <DropdownMenuItem
              onClick={() =>
                run(() => setMemberRole(userId, "OWNER"), "Promoted to owner")
              }
            >
              <ShieldIcon /> Make owner
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                run(() => setMemberRole(userId, "MEMBER"), "Changed to member")
              }
            >
              <UserIcon /> Make member
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() =>
              startTransition(async () => {
                try {
                  const { tempPassword } = await resetMemberPassword(userId)
                  setResetPassword(tempPassword)
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Action failed"
                  )
                }
              })
            }
          >
            <KeyRoundIcon /> Reset password
          </DropdownMenuItem>

          {status === "ACTIVE" ? (
            <DropdownMenuItem
              disabled={isSelf}
              onClick={() =>
                run(
                  () => setMemberStatus(userId, "DISABLED"),
                  "Member disabled"
                )
              }
            >
              <UserXIcon /> Disable
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                run(() => setMemberStatus(userId, "ACTIVE"), "Member enabled")
              }
            >
              <UserIcon /> Enable
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes their account and login access. To keep
              the account but block sign-in, use Disable instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault()
                setConfirmDelete(false)
                run(() => deleteMember(userId), "Member deleted")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={resetPassword !== null}
        onOpenChange={(next) => {
          if (!next) {
            setResetPassword(null)
            router.refresh()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New password for {name}</DialogTitle>
            <DialogDescription>
              Share this one-time password with them. It won&apos;t be shown
              again.
            </DialogDescription>
          </DialogHeader>
          {resetPassword ? <TempPasswordBox password={resetPassword} /> : null}
          <DialogFooter>
            <Button onClick={() => setResetPassword(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
