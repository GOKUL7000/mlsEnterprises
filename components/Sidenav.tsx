"use client"

import { useState } from "react"

import Link from "next/link"
import { Building2, LayoutDashboard, Menu, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { rolePermissions } from "@/config/rolePermissions"
import { menuItems } from "@/config/menuItems"
import { usePathname } from "next/navigation"


export default function Sidenav({
  collapsed,
}: {
  collapsed: boolean
}) {
  const router = useRouter()
  const { role, loading, logout } = useAuth()
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  const allowedKeys =
    rolePermissions[role as keyof typeof rolePermissions] ?? []

  if (loading) return null
  return (
    <aside
      className={`border-r bg-background transition-all duration-300 
        ${collapsed ? "w-20" : "w-64"} ` } 
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        {collapsed ? (
          <Image
            src="/images/mlsLogo.jpeg"
            alt="Logo"
            width={32}
            height={32}
          />
        ) : (
          <Image
            src="/images/mlsLogo.jpeg"
            alt="Logo"
            width={60}
            height={22}
          />
        )}
        
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2">
      {menuItems
        .filter((item) => allowedKeys.includes(item.key))
        .map((item) => {
          const Icon = item.icon

          const isActive =
            item.href !== "#" &&
            (pathname === item.href ||
              pathname.startsWith(item.href + "/"))

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                ${
                  isActive
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:bg-muted"
                }
              `}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

    </nav>
    </aside>
  )
}
