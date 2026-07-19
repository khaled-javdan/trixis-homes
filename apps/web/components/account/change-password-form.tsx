"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { changeOwnPassword } from "@/lib/actions/auth"

export function ChangePasswordForm() {
  const [pending, startTransition] = React.useTransition()
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function submit() {
    setError(null)
    if (newPassword !== confirm) {
      setError("New passwords don't match")
      return
    }
    startTransition(async () => {
      const result = await changeOwnPassword({ currentPassword, newPassword })
      if (result.ok) {
        toast.success("Password updated")
        setCurrentPassword("")
        setNewPassword("")
        setConfirm("")
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button
          type="submit"
          disabled={pending || !currentPassword || !newPassword || !confirm}
        >
          {pending ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  )
}
