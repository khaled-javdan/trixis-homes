"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, CopyIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { inviteMember } from "@/lib/actions/members"

export function InviteMemberDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [saving, startSaving] = React.useTransition()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [role, setRole] = React.useState<"OWNER" | "MEMBER">("MEMBER")
  // Shown once, after creation — the owner shares it with the new member.
  const [tempPassword, setTempPassword] = React.useState<string | null>(null)

  function reset() {
    setName("")
    setEmail("")
    setTitle("")
    setPhone("")
    setRole("MEMBER")
    setTempPassword(null)
  }

  function handleInvite() {
    startSaving(async () => {
      try {
        const { tempPassword } = await inviteMember({
          name,
          email,
          role,
          title,
          phone,
        })
        setTempPassword(tempPassword)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to invite member"
        )
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlusIcon /> Invite member
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        {tempPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Member invited</DialogTitle>
              <DialogDescription>
                Share this one-time password with {email}. They should change it
                after signing in. It won&apos;t be shown again.
              </DialogDescription>
            </DialogHeader>
            <TempPasswordBox password={tempPassword} />
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
              <DialogDescription>
                Create an account and share the generated password with them.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jane@trixishomes.com"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="member-title">Job title</Label>
                  <Input
                    id="member-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Property Consultant"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="member-phone">Phone</Label>
                  <Input
                    id="member-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+971 …"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="member-role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) =>
                    setRole(value === "OWNER" ? "OWNER" : "MEMBER")
                  }
                >
                  <SelectTrigger id="member-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">
                      Member — full app access
                    </SelectItem>
                    <SelectItem value="OWNER">
                      Owner — can also manage members
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleInvite}
                disabled={saving || !email.trim()}
              >
                {saving ? "Inviting…" : "Invite"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function TempPasswordBox({ password }: { password: string }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2">
      <code className="flex-1 px-1 font-mono text-sm">{password}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Copy password"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(password)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            toast.error("Couldn't copy — select and copy manually")
          }
        }}
      >
        {copied ? <CheckIcon className="text-green-600" /> : <CopyIcon />}
      </Button>
    </div>
  )
}
