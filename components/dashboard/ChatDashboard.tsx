"use client"

import { useState } from "react"
import {
  MessageCircle,
  Facebook,
  MessageSquare,
} from "lucide-react"

const chatStats = [
  {
    title: "Total Chats",
    value: 0,
    icon: MessageCircle,
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "Facebook",
    value: 0,
    icon: Facebook,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "WhatsApp",
    value: 0,
    icon: MessageSquare,
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },
]

const filters = ["Today", "1W", "15D", "1M", "ALL"]

export default function ChatDashboard() {
  const [activeFilter, setActiveFilter] = useState("Today")

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat Dashboard</h2>

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

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatStats.map((item) => {
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
    </div>
  )
}
