"use client"

import * as Tabs from "@radix-ui/react-tabs"
import PhoneDashboard from "./PhoneDashboard"
import ActivitiesDashboard from "./ActivitiesDashboard"
import LiveUserDashboard from "./LiveUserDashboard"
import EmailDashboard from "./EmailDashboard"
import ChatDashboard from "./ChatDashboard"
import SalesDashboard from "./SalesDashboard"
import SmsDashboard from "./SmsDashboard"
import OverallDashboard from "./OverallDashboard"


export default function DashboardTabs() {
  return (
    <Tabs.Root defaultValue="sales" className="w-full">
      {/* Tabs header */}
      <Tabs.List className="flex gap-6 border-b mb-6">
        {/* <Tab value="activities">Activities Dashboard</Tab>
        <Tab value="phone">Phone Dashboard</Tab> */}
        <Tab value="overall">Overall Dashboard</Tab>
        <Tab value="sales">Sales Dashboard</Tab>
        {/* <Tab value="chat">Chat Dashboard</Tab>
        <Tab value="email">Email Dashboard</Tab>
        <Tab value="sms">SMS Dashboard</Tab>
        <Tab value="live">Live User Dashboard</Tab> */}
      </Tabs.List>

      {/* Tabs content */}
     
      <Tabs.Content value="overall">
        <OverallDashboard/>
      </Tabs.Content>
      <Tabs.Content value="sales">
        <SalesDashboard/>
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
