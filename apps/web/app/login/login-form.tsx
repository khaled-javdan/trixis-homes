"use client"

import { useActionState } from "react"
import Link from "next/link"
import { LockIcon } from "lucide-react"

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

import { login, type LoginState } from "@/lib/actions/auth"

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  )

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockIcon className="size-4" />
          Sign in
        </CardTitle>
        <CardDescription>
          Sign in with your Trixis Homes email and password. Accounts are
          created by an owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <Link
            href="/reset-password"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
