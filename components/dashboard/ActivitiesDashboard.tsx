"use client"

import { Button } from "@/components/ui/button"
import { SummaryCard } from "@/components/dashboard/SummaryCard"
import { TaskTable } from "@/components/dashboard/TaskTable"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ActivitiesDashboard() {

  const { session, role } = useAuth()

  const [tasks, setTasks] = useState<any[]>([])
  const [counts, setCounts] = useState({
    open: 0,
    completed: 0,
    overdue: 0,
    all: 0,
  })

 


    useEffect(() => {
    if (!session) return

    const tableName = `${session.companyName}LeadTable`

    const fetchTasks = async () => {
      let query = supabase
      .from("leadFollowUpTable")
      .select(`
        *,
        userTable (
          name
        )
      `)
      .eq("companyID", session.companyID)

    // 🔹 Apply user filter ONLY for Telecaller
    if (role === "INSIDESALE") {
      query = query.eq("userID", session.userID)
    }

const { data: followUps, error } = await query

  if (error) {
    console.error(error)
    return
  }

  if (!followUps || followUps.length === 0) {
    setTasks([])
    setCounts({ open: 0, completed: 0, overdue: 0, all: 0 })
    return
  }

  // 🔹 Step 1: Extract leadIDs
  const leadIDs = followUps.map((f: any) => f.leadID)

  // 🔹 Step 2: Fetch Leads from Dynamic Table
  const { data: leads } = await supabase
    .from(tableName)
    .select("leadID, lead_name, contact_number")
    .in("leadID", leadIDs)

  // 🔹 Step 3: Convert Leads to Map
  const leadMap: Record<string, any> = {}
  leads?.forEach((lead: any) => {
    leadMap[lead.leadID] = lead
  })

  // 🔹 Step 4: Merge Lead Data
  const merged = followUps.map((task: any) => ({
    ...task,
    lead_name: leadMap[task.leadID]?.lead_name || "Unknown",
    contact_number: leadMap[task.leadID]?.contact_number || "-",
  }))

  // 🔹 Step 5: Count Logic
  const now = new Date()

  let open = 0
  let completed = 0
  let overdue = 0

  merged.forEach((task: any) => {
    const followUpDateTime = new Date(`${task.date}T${task.time}`)

    if (task.followUpStatus == false) {
      completed++
    } else {
      open++
      if (followUpDateTime < now) {
        overdue++
      }
    }
  })

  setCounts({
    open,
    completed,
    overdue,
    all: merged.length,
  })

  setTasks(merged)
}


    fetchTasks()
  }, [session])





  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Open Tasks" value={counts.open} bg="bg-teal-100" />
        <SummaryCard title="Completed Tasks" value={counts.completed} bg="bg-slate-100" />
        <SummaryCard title="Overdue Tasks" value={counts.overdue} bg="bg-orange-100" />
        <SummaryCard title="All Tasks" value={counts.all} bg="bg-green-100" />
      </div>

      {/* Actions */}
      {/* <div className="flex justify-end gap-2">
        <Button variant="secondary">Add Task</Button>
        <Button variant="destructive">Filter Task</Button>
      </div> */}

      {/* Table */}
      <TaskTable tasks={tasks} />
      
    </div>
  )
}
