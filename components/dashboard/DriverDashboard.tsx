"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function DriverDashboard() {
  const { session } = useAuth()

  const [stats, setStats] = useState({
    totalFreight: 0,
    settledAmount: 0,
    pendingAmount: 0,
    completedTrips: 0,
    pendingTrips: 0,
  })

  useEffect(() => {
    if (session?.userID) {
      fetchDashboard()
    }
  }, [session])

  const fetchDashboard = async () => {
    const { data: driverData, error: driverError } =
      await supabase
        .from("driversTable")
        .select("driverID")
        .eq("driverName", session?.name)
        .single()

    if (driverError || !driverData) {
      toast.error("Driver not found")
      return
    }

    const { data: trips, error } = await supabase
      .from("tripsTable")
      .select("*")
      .eq("driverID", driverData.driverID)

    if (error) {
      toast.error("Failed to load dashboard")
      return
    }

    const totalFreight = trips?.reduce(
      (sum, trip) =>
        sum + Number(trip.freightAmount || 0),
      0
    )

    const settledAmount = trips?.reduce(
      (sum, trip) =>
        sum + Number(trip.receivedAmount || 0),
      0
    )

    const pendingAmount =
      totalFreight - settledAmount

    const completedTrips =
      trips?.filter(
        (trip) => trip.tripStatus === "COMPLETED"
      ).length || 0

    const pendingTrips =
      trips?.filter(
        (trip) => trip.tripStatus !== "COMPLETED"
      ).length || 0

    setStats({
      totalFreight,
      settledAmount,
      pendingAmount,
      completedTrips,
      pendingTrips,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Driver Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your trips and earnings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Total Freight
          </p>
          <h2 className="text-2xl font-bold">
            ₹{stats.totalFreight.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Settled Amount
          </p>
          <h2 className="text-2xl font-bold text-green-600">
            ₹{stats.settledAmount.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Pending Amount
          </p>
          <h2 className="text-2xl font-bold text-red-600">
            ₹{stats.pendingAmount.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Completed Trips
          </p>
          <h2 className="text-2xl font-bold text-green-600">
            {stats.completedTrips}
          </h2>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Pending Trips
          </p>
          <h2 className="text-2xl font-bold text-orange-600">
            {stats.pendingTrips}
          </h2>
        </div>
      </div>
    </div>
  )
}