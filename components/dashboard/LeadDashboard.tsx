"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

type StatusCount = {
  statusName: string
  count: number
  color?: string
}




export default function LeadDashboard({
  selectedTelecaller,
  activeFilter,
  filtersData,
  leadNameSearch,
  mobileSearch,
}: {
  selectedTelecaller?: string | null
  activeFilter?: string
  filtersData?: {
  segmentID: string[]
  sourceID: string[]
  statusID: string[]
  assignID: string[]
  groupID: string[]
  teamID: string[]
  vertical: string[]
  fromDate?: string
  toDate?: string
}
  leadNameSearch?: string
  mobileSearch?: string
}) {
  const { session } = useAuth()

  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLeads, setTotalLeads] = useState(0)

  
 useEffect(() => {
  const fetchCounts = async () => {
    if (!session) return

    setLoading(true)
    

    
    
    // 1️⃣ Get all statuses for company
    const { data: statuses, error: statusError } = await supabase
      .from("statusTable")
      .select("statusID, statusName, color")
      .eq("status", true)
      .eq("companyID", session.companyID)
      .order("sequence", { ascending: true })

    if (statusError) {
      console.error(statusError)
      return
    }

    const userToFilter =  selectedTelecaller ?? session.userID
    const tableName = `${session.companyName}LeadTable`
    // 2️⃣ Get all leads for this telecaller
    

      let query = supabase
        .from(tableName)
        .select("statusID")
        .eq("companyID", session.companyID)
        //.eq("assignID", userToFilter)

      // 🔹 Date filter
      const dateFilter = getDateFilter()
      if (dateFilter) {
        query = query.gte("updated_at", dateFilter)
      }

      // 🔹 Popup filters
      // 🔹 Multi Select Filters
      if (filtersData?.segmentID?.length)
        query = query.in("segmentID", filtersData.segmentID)

      if (filtersData?.sourceID?.length)
        query = query.in("sourceID", filtersData.sourceID)

      if (filtersData?.statusID?.length)
        query = query.in("statusID", filtersData.statusID)

      if (filtersData?.assignID?.length) {
        query = query.in("assignID", filtersData.assignID)
      } else {
        query = query.eq("assignID", userToFilter)
      }

      if (filtersData?.groupID?.length)
        query = query.in("groupID", filtersData.groupID)

      if (filtersData?.teamID?.length)
        query = query.in("teamID", filtersData.teamID)


      if (filtersData?.vertical?.length)
        query = query.in("vertical", filtersData.vertical)

      // 🔹 Date Range
      if (filtersData?.fromDate) {
        const start = new Date(filtersData.fromDate)
        start.setHours(0, 0, 0, 0)
        query = query.gte("updated_at", start.toISOString())
      }

      if (filtersData?.toDate) {
        const end = new Date(filtersData.toDate)
        end.setHours(23, 59, 59, 999)
        query = query.lte("updated_at", end.toISOString())
      }

      // 🔹 Search filters
      if (leadNameSearch?.trim())
        query = query.ilike("lead_name", `%${leadNameSearch}%`)

      if (mobileSearch?.trim())
        query = query.ilike("contact_number", `%${mobileSearch}%`)

      const { data: leads, error: leadError  } = await query

    if (leadError) {
      console.error(leadError)
      return
    }

    setTotalLeads(leads?.length || 0)

    // 3️⃣ Count
    const counts = (statuses || []).map((status) => {
      const count =
        (leads || []).filter(
          (lead) =>
            String(lead.statusID) === String(status.statusID)
        ).length

      return {
        statusName: status.statusName,
        count,
        color: status.color,
      }
    })


    setStatusCounts(counts)
    setLoading(false)
  }

  fetchCounts()
}, [
  session?.companyID,
  session,
  selectedTelecaller,
  activeFilter,
  filtersData,
  leadNameSearch,
  mobileSearch
])


const getDateFilter = () => {
  const now = new Date()

  switch (activeFilter) {
    case "Today":
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      return todayStart.toISOString()

    case "1W":
      const oneWeek = new Date(now)
      oneWeek.setDate(now.getDate() - 7)
      return oneWeek.toISOString()

    case "15D":
      const fifteenDays = new Date(now)
      fifteenDays.setDate(now.getDate() - 15)
      return fifteenDays.toISOString()

    case "1M":
      const oneMonth = new Date(now)
      oneMonth.setMonth(now.getMonth() - 1)
      return oneMonth.toISOString()

    default:
      return null
  }
}





  if (loading) return <div>Loading Dashboard...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      
      {/* Total Leads Card */}
      <div className="rounded-xl p-4 shadow-md bg-linear-to-r from-indigo-500 to-blue-600 text-white">
        <p className="text-sm opacity-80">
          Total Leads
        </p>
        <h2 className="text-3xl font-bold mt-2">
          {totalLeads}
        </h2>
      </div>


      {statusCounts.map((item) => (
        <div
          key={item.statusName}
          className="rounded-xl p-4 shadow-sm text-white"
          style={{
            backgroundColor: item.color || "#6b7280",
          }}
        >
          <p className="text-sm font-medium">
            {item.statusName}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {item.count}
          </h2>
        </div>
      ))}


 

    </div>

  )
}
