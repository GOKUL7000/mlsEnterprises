"use client"

import * as Tabs from "@radix-ui/react-tabs"
import PhoneDashboard from "./PhoneDashboard"
import ActivitiesDashboard from "./ActivitiesDashboard"
import LeadDashboard from "./LeadDashboard"


export default function TeleCallerDashboard() {
  return (
    <Tabs.Root defaultValue="activities" className="w-full">
      {/* Tabs header */}
      <Tabs.List className="flex gap-6 border-b mb-6">
        <Tab value="activities">Activities Dashboard</Tab>
        <Tab value="leads">Leads Dashboard</Tab>
        <Tab value="phone">Phone Dashboard</Tab>
        
      </Tabs.List>

      {/* Tabs content */}
      <Tabs.Content value="activities">
        <ActivitiesDashboard />
      </Tabs.Content>

      <Tabs.Content value="phone">
        <PhoneDashboard /> 
      </Tabs.Content>

      <Tabs.Content value="leads">
        <LeadDashboard />
      </Tabs.Content>

      
    </Tabs.Root>
  )
}

function Tab({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <Tabs.Trigger
      value={value}
      className="
        pb-2 text-sm font-medium text-muted-foreground
        data-[state=active]:border-b-2
        data-[state=active]:border-primary
        data-[state=active]:text-primary
      "
    >
      {children}
    </Tabs.Trigger>
  )
}
