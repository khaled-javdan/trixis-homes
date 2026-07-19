"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  Building2Icon,
  ClipboardCheckIcon,
  InboxIcon,
  LandmarkIcon,
  LayoutGridIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@workspace/db"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { UserAvatar } from "@/components/user-avatar"
import { logout } from "@/lib/actions/auth"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const mainNav: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutGridIcon },
  { href: "/communities", label: "Communities", icon: Building2Icon },
  { href: "/favorites", label: "Favorites", icon: StarIcon },
]

// Admin-only actions. As the admin app grows, add new destinations here.
const adminNav: NavItem[] = [
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/leads", label: "Leads", icon: InboxIcon },
  { href: "/developers", label: "Developers", icon: LandmarkIcon },
  { href: "/projects/new", label: "New Project", icon: PlusIcon },
  { href: "/projects/ai-import", label: "Paste to Create", icon: SparklesIcon },
  {
    href: "/projects/inventory-update",
    label: "Inventory Update",
    icon: ClipboardCheckIcon,
  },
]

// Owner-only destinations (member management).
const ownerNav: NavItem[] = [
  { href: "/members", label: "Members", icon: UsersIcon },
]

function isItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function AppSidebar({
  admin,
  role,
  userName,
  userEmail,
  avatarUrl,
  marketingUrl,
}: {
  admin: boolean
  role: UserRole | null
  userName: string | null
  userEmail: string | null
  avatarUrl: string | null
  marketingUrl: string
}) {
  const pathname = usePathname()
  const adminItems =
    role === "OWNER" ? [...adminNav, ...ownerNav] : adminNav

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <a
          href={marketingUrl}
          className="flex items-center group-data-[collapsible=icon]:hidden"
        >
          <span className="flex h-10 items-center rounded-md bg-white px-2 py-1.5">
            <Image
              src="/logo.svg"
              alt="Trixis Homes"
              width={105}
              height={74}
              priority
              className="h-full w-auto"
            />
          </span>
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isItemActive(pathname, item.href)}
                    tooltip={item.label}
                    render={
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {admin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isItemActive(pathname, item.href)}
                      tooltip={item.label}
                      render={
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {admin && (
        <SidebarFooter>
          {userEmail ? (
            <div className="flex items-center gap-2 px-1 pb-1">
              <UserAvatar
                name={userName}
                email={userEmail}
                avatarUrl={avatarUrl}
                size="sm"
              />
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="truncate text-sm font-medium">
                  {userName ?? userEmail}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {role === "OWNER" ? "Owner" : "Member"}
                </div>
              </div>
            </div>
          ) : null}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isItemActive(pathname, "/account")}
                tooltip="Account"
                render={
                  <Link href="/account">
                    <UserCogIcon />
                    <span>Account</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <form action={logout}>
                <SidebarMenuButton
                  type="submit"
                  tooltip="Log out"
                  render={
                    <button type="submit">
                      <LogOutIcon />
                      <span>Log out</span>
                    </button>
                  }
                />
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
