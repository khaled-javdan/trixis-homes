"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, KeyRoundIcon, MailIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import {
  requestPasswordReset,
  resetPasswordWithOtp,
} from "@/lib/actions/auth"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = React.useState<"request" | "verify">("request")
  const [pending, startTransition] = React.useTransition()

  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function sendCode() {
    setError(null)
    startTransition(async () => {
      try {
        await requestPasswordReset(email)
        setPhase("verify")
        toast.success("If that email has an account, a code is on its way.")
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  function submitReset() {
    setError(null)
    startTransition(async () => {
      const result = await resetPasswordWithOtp({ email, otp, newPassword })
      if (result.ok) {
        toast.success("Password updated. Please sign in.")
        router.push("/login")
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Card className="w-full max-w-sm">
      {phase === "request" ? (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailIcon className="size-4" />
              Reset your password
            </CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a one-time code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                sendCode()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending || !email.trim()}>
                {pending ? "Sending…" : "Send code"}
              </Button>
              <BackToLogin />
            </form>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-4" />
              Enter your code
            </CardTitle>
            <CardDescription>
              We sent a 6-digit code to {email}. It expires in 10 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                submitReset()
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">Reset code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
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
                <p className="text-xs text-muted-foreground">
                  At least 8 characters.
                </p>
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button
                type="submit"
                disabled={pending || otp.length < 6 || !newPassword}
              >
                {pending ? "Updating…" : "Reset password"}
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setPhase("request")
                  setOtp("")
                  setError(null)
                }}
              >
                Use a different email
              </button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  )
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-3.5" /> Back to sign in
    </Link>
  )
}
