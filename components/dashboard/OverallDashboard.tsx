import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

import {
  Users,
  Building2,
  UserCheck,
  Truck,
  DollarSign,
  Receipt,
  TrendingUp,
} from "lucide-react"




export default function SalesDashboard() {
   const { session, loading } = useAuth()
    const filters = ["Today", "1W", "15D", "1M", "ALL"]

    const [activeFilter, setActiveFilter] = useState("1M")

    const [stats, setStats] = useState({
    parties: 0,
    suppliers: 0,
    drivers: 0,
    trucks: 0,
    income: 0,
    expense: 0,
    profit: 0,
    })

   const fetchDashboardData = async () => {
  const [
    partiesRes,
    suppliersRes,
    driversRes,
    trucksRes,
    tripsRes,
    expensesRes,
  ] = await Promise.all([
    supabase
      .from("partiesTable")
      .select("*", { count: "exact", head: true })
      .eq("companyID", session?.companyID),

    supabase
      .from("supplierTable")
      .select("*", { count: "exact", head: true })
      .eq("companyID", session?.companyID),

    supabase
      .from("driversTable")
      .select("*", { count: "exact", head: true })
      .eq("companyID", session?.companyID),

    supabase
      .from("trucksTable")
      .select("*", { count: "exact", head: true })
      .eq("companyID", session?.companyID),

    supabase
      .from("tripsTable")
      .select("*")
      .eq("companyID", session?.companyID),

    supabase
      .from("trip_expenses")
      .select("*")
  ])

  let tripsData = tripsRes.data || []
  let expensesData = expensesRes.data || []

  const today = new Date()

  const applyFilter = (items: any[]) => {
    if (activeFilter === "ALL") return items

    return items.filter((item) => {
      const date = new Date(item.created_at)

      switch (activeFilter) {
        case "Today":
          return date.toDateString() === today.toDateString()

        case "1W":
          return (
            date >=
            new Date(
              today.getTime() - 7 * 24 * 60 * 60 * 1000
            )
          )

        case "15D":
          return (
            date >=
            new Date(
              today.getTime() - 15 * 24 * 60 * 60 * 1000
            )
          )

        case "1M":
          const monthAgo = new Date()
          monthAgo.setMonth(today.getMonth() - 1)
          return date >= monthAgo

        default:
          return true
      }
    })
  }

  tripsData = applyFilter(tripsData)
  expensesData = applyFilter(expensesData)

  const income = tripsData.reduce(
    (sum, item) =>
      sum + Number(item.freightAmount || 0),
    0
  )

  const expense = expensesData.reduce(
    (sum, item) =>
      sum + Number(item.expense_amount || 0),
    0
  )

  setStats({
    parties: partiesRes.count || 0,
    suppliers: suppliersRes.count || 0,
    drivers: driversRes.count || 0,
    trucks: trucksRes.count || 0,
    income,
    expense,
    profit: income - expense,
  })
}

useEffect(() => {
  if (loading) return
  if (!session) return

  fetchDashboardData()
}, [session, activeFilter])

const cards = [
    {
    title: "Income",
    value: `₹${stats.income.toLocaleString("en-IN")}`,
    icon: DollarSign,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
  },
  {
    title: "Expenses",
    value: `₹${stats.expense.toLocaleString("en-IN")}`,
    icon: Receipt,
    bg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-red-200",
  },
  {
    title: "Net Profit",
    value: `₹${stats.profit.toLocaleString("en-IN")}`,
    icon: TrendingUp,
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    border: "border-indigo-200",
  },
  {
    title: "Parties",
    value: stats.parties,
    icon: Users,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-200",
  },
  {
    title: "Suppliers",
    value: stats.suppliers,
    icon: Building2,
    bg: "bg-purple-100",
    iconColor: "text-purple-600",
    border: "border-purple-200",
  },
  {
    title: "Drivers",
    value: stats.drivers,
    icon: UserCheck,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    border: "border-green-200",
  },
  {
    title: "Trucks",
    value: stats.trucks,
    icon: Truck,
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
    border: "border-orange-200",
  },
  
]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Overall Dashboard
        </h2>

        <div className="flex rounded-lg bg-muted p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-sm rounded-md transition ${
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
  {cards.map((item) => {
    const Icon = item.icon

    return (
      <div
        key={item.title}
        className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {item.title}
            </p>

            <h3 className="mt-3 text-3xl font-bold tracking-tight">
              {item.value}
            </h3>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}
          >
            <Icon className={`h-7 w-7 ${item.iconColor}`} />
          </div>
        </div>

        <div className="mt-4 h-1 w-full rounded-full bg-slate-100">
          <div
            className={`h-1 rounded-full ${
              item.iconColor.replace("text", "bg")
            }`}
            style={{ width: "70%" }}
          />
        </div>

        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-black/5 translate-x-8 -translate-y-8" />
      </div>
    )
  })}
</div>
      
    </div>
  )
}