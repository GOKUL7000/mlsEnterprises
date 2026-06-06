"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

// const users = [
//   {
//     name: "kavyacc",
//     id: "646844",
//     online: true,
//     login: true,
//     vpn: true,
//     break: false,
//     pause: false,
//     acw: false,
//     call: {
//       type: "Outgoing",
//       did: "07971824510",
//       number: "9663313454",
//       duration: "Calling...",
//     },
//   },
//   {
//     name: "anniecc",
//     id: "320591",
//     online: true,
//     login: true,
//     vpn: true,
//     break: false,
//     pause: false,
//     acw: true,
//     idle: "00:00:16",
//   },
//   {
//     name: "jennercc",
//     id: "671637",
//     online: true,
//     login: true,
//     vpn: true,
//     break: false,
//     pause: false,
//     acw: false,
//     idle: "00:00:30",
//   },
// ]

export default function LiveUserDashboard() {
  const { session } = useAuth()

  const [stats, setStats] = useState({
    total: 0,
    loggedIn: 0,
    loggedOut: 0,
    break: 0,
  })

  const [loading, setLoading] = useState(false)

  // ✅ Fetch Function (Outside useEffect)
  const fetchStats = async () => {
    if (!session?.companyID) return

    setLoading(true)

    try {
      // 1️⃣ TOTAL INSIDESALE USERS
      const { data: totalUsers } = await supabase
        .from("loginTable")
        .select(`
          userID,
          userTable!inner (
            companyID,
            userStatus
          )
        `)
        .eq("role", "INSIDESALE")
        .eq("userTable.companyID", session.companyID)
        .eq("userTable.userStatus", true)

      const totalCount = totalUsers?.length || 0

      // 2️⃣ ACTIVE USERS (logout_time IS NULL)
      const { data: onlineSessions } = await supabase
        .from("userSessionTable")
        .select(`
          userID,
          userTable!inner (
            companyID,
            loginTable!inner (
              role
            )
          )
        `)
        .eq("sessionStatus", "ONLINE")
        .is("logout_time", null)
        .eq("userTable.loginTable.role", "INSIDESALE")
        .eq("userTable.companyID", session.companyID)

      const uniqueOnlineUsers = new Set(
        onlineSessions?.map(u => u.userID)
      )

      const onlineCount = uniqueOnlineUsers.size

      

       // ✅ 3️⃣ On Break Users (break_end IS NULL)
        const { data: breakSessions } = await supabase
          .from("userSessionTable")
          .select(`
            userID,
            userTable!inner (
              companyID,
              loginTable!inner (
                role
              )
            )
          `)
          .eq("sessionStatus", "BREAK")
          .is("logout_time", null)
          .eq("userTable.loginTable.role", "INSIDESALE")
          .eq("userTable.companyID", session.companyID)

        const uniqueBreakUsers = new Set(
          breakSessions?.map(u => u.userID)
        )

        const breakCount = uniqueBreakUsers.size
    
        // 3️⃣ OFFLINE = TOTAL - ONLINE
      const offlineCount = totalCount - onlineCount - breakCount

      setStats({
        total: totalCount,
        loggedIn: onlineCount,
        loggedOut: offlineCount,
        break: breakCount,
      })

    } catch (err) {
      console.error("Error fetching stats:", err)
    }

    setLoading(false)
    fetchStats()
  }

  // ✅ Auto Load + Auto Refresh
  useEffect(() => {
    if (!session?.companyID) return

    fetchStats()

    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)

  }, [session?.companyID])

  const statCards = [
    { label: "TOTAL", value: stats.total, bg: "bg-slate-100" },
    { label: "LOGGED IN", value: stats.loggedIn, bg: "bg-green-100" },
    { label: "BREAK", value: stats.break, bg: "bg-orange-100" },
    { label: "LOGGED OUT", value: stats.loggedOut, bg: "bg-red-100" },

    { label: "VPN", value: 0, bg: "bg-blue-100" },
    { label: "HOLD", value: 0, bg: "bg-yellow-100" },
    { label: "ACW", value: 0, bg: "bg-cyan-100" },
    { label: "ON CALL", value: 0, bg: "bg-slate-100" },

  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">User Live Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time agent monitoring
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}