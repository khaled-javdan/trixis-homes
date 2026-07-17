"use client"

import * as React from "react"

const AdminContext = React.createContext(false)

/** Provides the viewer's admin status (resolved server-side in the root
 * layout) to client components so edit affordances can hide themselves. */
export function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean
  children: React.ReactNode
}) {
  return <AdminContext value={isAdmin}>{children}</AdminContext>
}

export function useIsAdmin(): boolean {
  return React.useContext(AdminContext)
}
