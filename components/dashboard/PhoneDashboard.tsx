"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from "lucide-react"
import { cn } from "@/lib/utils"

const filters = ["Today", "1W", "15D", "1M", "ALL"]

export default function PhoneDashboard() {
  const [activeFilter, setActiveFilter] = useState("Today")

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={activeFilter === f ? "default" : "secondary"}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Calls" value="77" icon={<Phone />} />
        <MetricCard title="Incoming Calls" value="0" icon={<PhoneIncoming />} />
        <MetricCard title="Outgoing Calls" value="77" icon={<PhoneOutgoing />} />
        <MetricCard title="Predictive Calls" value="0" icon={<Phone />} />
        <MetricCard title="Missed Calls" value="0" icon={<PhoneMissed />} />
        <MetricCard title="OBD Calls" value="0" icon={<Phone />} />

        <MetricCard title="Progressive Calls" value="0" icon={<Phone />} />
        <MetricCard title="New Callers" value="21" icon={<Phone />} />
        <MetricCard title="Old Callers" value="44" icon={<Phone />} />
        <MetricCard title="Connected Calls" value="38" icon={<Phone />} />
        <MetricCard title="Talktime" value="00:27:42" icon={<Phone />} />
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>

        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            "bg-teal-100 text-teal-700"
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
