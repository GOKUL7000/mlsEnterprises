"use client"

import { useState } from "react"
import {
  MessageSquareText,
  Send,
  CheckCircle,
  MousePointerClick,
  XCircle,
  ShieldAlert,
  UserMinus,
} from "lucide-react"

const smsStats = [
  {
    title: "Total SMS",
    value: 0,
    icon: MessageSquareText,
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "Sent",
    value: 0,
    icon: Send,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Delivered",
    value: 0,
    icon: CheckCircle,
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Clicked",
    value: 0,
    icon: MousePointerClick,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Failed",
    value: 0,
    icon: XCircle,
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Blocked",
    value: 0,
    icon: ShieldAlert,
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Unsubscribe",
    value: 0,
    icon: UserMinus,
    bg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
]

const filters = ["Today", "1W", "15D", "1M", "ALL"]

export default function SmsDashboard() {
  const [activeFilter, setActiveFilter] = useState("Today")

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">SMS Dashboard</h2>

        <div className="flex rounded-lg bg-muted p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-sm rounded-md transition
                ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {smsStats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {item.title}
                </p>

                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>

              <h3 className="mt-4 text-2xl font-bold">
                {item.value}
              </h3>
            </div>
          )
        })}
      </div>

      {/* OPTIONAL PLACEHOLDER */}
      <div className="rounded-xl border bg-background p-6 text-center text-muted-foreground">
        SMS delivery & click analytics will appear here
      </div>
    </div>
  )
}
