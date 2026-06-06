"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Target,
  Handshake,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { useAuth } from "@/hooks/useAuth"

const filters = ["Today", "1W", "15D", "1M", "ALL"]

export default function SalesDashboard() {
   const { session, loading } = useAuth()
  const [activeFilter, setActiveFilter] = useState("1M")

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    revenue: 0,
    pendingPayments: 0,
    pendingOrders: 0,
    totalExpenses: 0,
    netProfit: 0,
  })

  useEffect(() => {
     if (loading) return
      if (!session) return

    fetchSalesData()
  }, [activeFilter, session])

  const fetchSalesData = async () => {
    const [
      { data, error },
      { data: expenseData },
    ] = await Promise.all([
      supabase
        .from("tripsTable")
        .select("*"),
        // .eq("companyID", session?.companyID),

      supabase
        .from("trip_expenses")
        .select("trip_id, expense_amount"),
    ])

if (error) {
  console.error(error)
  return
}

let filteredData = [...data]

const today = new Date()

switch (activeFilter) {
  case "Today":
    filteredData = data.filter((item) => {
      const tripDate = new Date(item.created_at) // change field name
      return tripDate.toDateString() === today.toDateString()
    })
    break

  case "1W":
    filteredData = data.filter((item) => {
      const tripDate = new Date(item.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      return tripDate >= weekAgo
    })
    break

  case "15D":
    filteredData = data.filter((item) => {
      const tripDate = new Date(item.created_at)
      const daysAgo = new Date()
      daysAgo.setDate(today.getDate() - 15)
      return tripDate >= daysAgo
    })
    break

  case "1M":
    filteredData = data.filter((item) => {
      const tripDate = new Date(item.created_at)
      const monthAgo = new Date()
      monthAgo.setMonth(today.getMonth() - 1)
      return tripDate >= monthAgo
    })
    break

  default:
    filteredData = data
}

    const totalSales = filteredData.reduce(
  (sum, item) => sum + Number(item.freightAmount || 0),
  0
)

const totalOrders = filteredData.length

const revenue = filteredData
  .filter((item) => item.tripStatus === false)
  .reduce(
    (sum, item) => sum + Number(item.freightAmount || 0),
    0
  )

const pendingPayments = filteredData
  .filter((item) => item.tripStatus === true)
  .reduce(
    (sum, item) => sum + Number(item.freightAmount || 0),
    0
  )

  const filteredTripIDs = filteredData.map(
  (trip) => trip.tripID
)

const totalExpenses = (
  expenseData || []
)
  .filter((expense) =>
    filteredTripIDs.includes(expense.trip_id)
  )
  .reduce(
    (sum, expense) =>
      sum +
      Number(expense.expense_amount || 0),
    0
  )

  const netProfit =
  revenue - totalExpenses

const pendingOrders = filteredData.filter(
  (item) => item.tripStatus === true
).length
    setStats({
      totalSales,
      totalOrders,
      revenue,
      pendingPayments,
      pendingOrders,
      totalExpenses,
      netProfit
    })
  }

  const salesStats = [
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString("en-IN")}`,
      icon: DollarSign,
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Expenses",
      value: `₹${stats.totalExpenses.toLocaleString("en-IN")}`,
      icon: Target,
      bg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Net Profit",
      value: `₹${stats.netProfit.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending Payments",
      value: `₹${stats.pendingPayments.toLocaleString("en-IN")}`,
      icon: Target,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Handshake,
      bg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ]

 const pieData = [
  {
    category: "Net Profit",
    amount: stats.netProfit,
  },
  {
    category: "Expenses",
    amount: stats.totalExpenses,
  },
]

const barData = [
  {
    status: "Completed",
    count: stats.totalOrders - stats.pendingOrders,
  },
  {
    status: "Pending",
    count: stats.pendingOrders,
  },
]

const COLORS = ["#10b981", "#f59e0b"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Sales Dashboard
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-6">
        {salesStats.map((item) => {
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
                  <Icon
                    className={`h-5 w-5 ${item.iconColor}`}
                  />
                </div>
              </div>

              <h3 className="mt-4 text-2xl font-bold">
                {item.value}
              </h3>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PIE CHART */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Profit Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="amount"
                nameKey="category"
                outerRadius={100}
                label
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Trip Status Count
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}