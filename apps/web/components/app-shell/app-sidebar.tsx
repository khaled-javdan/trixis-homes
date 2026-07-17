"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2Icon,
  ClipboardCheckIcon,
  InboxIcon,
  LayoutGridIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react"

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
  { href: "/leads", label: "Leads", icon: InboxIcon },
  { href: "/projects/new", label: "New Project", icon: PlusIcon },
  { href: "/projects/ai-import", label: "Paste to Create", icon: SparklesIcon },
  {
    href: "/projects/inventory-update",
    label: "Inventory Update",
    icon: ClipboardCheckIcon,
  },
]

function isItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function AppSidebar({
  admin,
  marketingUrl,
}: {
  admin: boolean
  marketingUrl: string
}) {
  const pathname = usePathname()

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
              {adminNav.map((item) => {
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
          <SidebarMenu>
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
