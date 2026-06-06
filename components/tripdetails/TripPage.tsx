"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

import TripForm from "./TripForm"
import TripsList from "./TripsList"

export type Trip = {
  tripID: number

  companyID: string | null

  partiesID: string
  truckID: string

  supplierID?: string
  driverID?: string

  origin: string
  destination: string

  billingType: string

  quantity?: string
  rate?: string

  freightAmount: string

  startDate: string
  endDate: string

  start_km: number

  lrNumber: string

  materialName: string

  notes: string


  tripStatus: boolean

  createdBy: string | null

  partyName?: string
  truckNumber?: string
  ownershipType?: string
  driverName?: string
  supplierName?: string

  totalExpense?: number
  profit?: number
}

export default function TripPage() {
  const { session, loading } = useAuth()

  const [trips, setTrips] = useState<Trip[]>([])

  const [open, setOpen] = useState(false)

  const [editing, setEditing] =
    useState<Trip | null>(null)

  const [search, setSearch] = useState("")

  const [activeTab, setActiveTab] = useState<"PENDING" | "COMPLETED">("PENDING")

  useEffect(() => {
    if (loading) return

    fetchTrips()
  }, [session?.companyID, loading])

  const fetchTrips = async () => {

    
      let query = supabase
        .from("tripsTable")
        .select("*")
        .eq("companyID", session?.companyID)
        // .eq("tripStatus", true)

        

      // If logged-in user is DRIVER
      if (session?.role === "DRIVER") {
        const { data: driver } = await supabase
          .from("driversTable")
          .select("driverID")
          .eq("driverName", session?.name)
          .single()

        if (driver) {
          query = query.eq(
            "driverID",
            driver.driverID
          )
        }
      }

      const { data: tripData, error } =
        await query.order("tripID", {
          ascending: false,
        })

      if (error) {
        console.error(error)
        toast.error("Failed to fetch trips")
        return
      }

      const [
        { data: partyData },
        { data: truckData },
        { data: driverData },
        { data: supplierData },
        { data: expenseData },
      ] = await Promise.all([
        supabase
          .from("partiesTable")
          .select("partiesID, partyName"),

        supabase
          .from("trucksTable")
          .select(
            "truckID, truckNumber, ownershipType"
          ),

        supabase
          .from("driversTable")
          .select("driverID, driverName"),

        supabase
          .from("supplierTable")
          .select(
            "supplierID, supplierName"
          ),
          supabase
          .from("trip_expenses")
          .select("trip_id, expense_amount"),
      ])

      const updatedTrips =
        (tripData || []).map((trip) => {
          const party = partyData?.find(
            (p) =>
              p.partiesID === trip.partiesID
          )

          const truck = truckData?.find(
            (t) =>
              t.truckID === trip.truckID
          )

          const driver = driverData?.find(
            (d) =>
              d.driverID === trip.driverID
          )

          const supplier =
            supplierData?.find(
              (s) =>
                s.supplierID ===
                trip.supplierID
            )

          const tripExpenses =
            expenseData?.filter(
              (e) => e.trip_id === trip.tripID
            ) || []

          const totalExpense = tripExpenses.reduce(
            (sum, exp) =>
              sum + Number(exp.expense_amount || 0),
            0
          )


          return {
            ...trip,
            partyName:
              party?.partyName || "",
            truckNumber:
              truck?.truckNumber || "",
            ownershipType:
              truck?.ownershipType || "",
            driverName:
              driver?.driverName || "",
            supplierName:
              supplier?.supplierName || "",
            totalExpense,

            profit:
              Number(trip.freightAmount || 0) -
              totalExpense,
          }
        })

      console.log(
        "Fetched Trips:",
        updatedTrips
      )

      setTrips(updatedTrips)
    }

  const filteredTrips = trips.filter((trip) => {
  const text = search.toLowerCase()

  const matchesSearch =
    trip.partyName
      ?.toLowerCase()
      .includes(text) ||
    trip.truckNumber
      ?.toLowerCase()
      .includes(text) ||
    trip.origin
      ?.toLowerCase()
      .includes(text) ||
    trip.destination
      ?.toLowerCase()
      .includes(text)

  const matchesTab =
    activeTab === "PENDING"
      ? trip.tripStatus === true
      : trip.tripStatus === false

  return matchesSearch && matchesTab
})

  const handleSave = async (
    trip: Trip
  ) => {

    console.log("Saving Trip:", trip)
    if (editing) {
      const { error } =
        await supabase
          .from("tripsTable")
          .update({
            partiesID:
              trip.partiesID,

            truckID:
              trip.truckID,

            driverID:
              trip.driverID,
            supplierID:
              trip.supplierID,

            origin: trip.origin,

            destination:
              trip.destination,

            billingType:
              trip.billingType,

            rate: trip.rate || null,
            quantity: trip.quantity || null,

            freightAmount:
              trip.freightAmount,

            startDate:
              trip.startDate,

            start_km:
              trip.start_km,

            lrNumber:
              trip.lrNumber,

            materialName:
              trip.materialName,

            notes: trip.notes,
          })
          .eq(
            "tripID",
            editing.tripID
          )

      if (error) {
        console.error(error)
        toast.error(
          "Failed to update trip"
        )
        return
      }

      toast.success(
        "Trip updated successfully"
      )
    } else {
      const { error } =
        await supabase
          .from("tripsTable")
          .insert([
            {
              companyID:
                session?.companyID ||
                null,

              partiesID: trip.partiesID,
              driverID: trip.driverID || null,
              supplierID: trip.supplierID || null,

              truckID: trip.truckID,

              origin: trip.origin,

              destination:
                trip.destination,

              billingType:
                trip.billingType,
              
              ratePer: trip.rate || null,
              totalRate: trip.quantity || null,

              freightAmount:
                trip.freightAmount,

              startDate:
                trip.startDate,

              start_km:
                trip.start_km,

              lrNumber:
                trip.lrNumber,

              materialName:
                trip.materialName,

              notes: trip.notes,

              createdBy:
                session?.userID ||
                null,

              tripStatus: true,
            },
          ])

      if (error) {
        console.error(error)
        toast.error(
          "Failed to save trip"
        )
        return
      }

      toast.success(
        "Trip added successfully"
      )
    }

    setOpen(false)
    setEditing(null)

    fetchTrips()
  }

  const handleDelete = async (
    tripID: number
  ) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete?"
    )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from("tripsTable")
        .update({
          tripStatus: false,
        })
        .eq("tripID", tripID)

    if (error) {
      console.error(error)
      toast.error(
        "Failed to delete trip"
      )
      return
    }

    toast.success(
      "Trip deleted successfully"
    )

    fetchTrips()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Trips
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage trips here.
          </p>
        </div>
        
        
        {session?.role !== "DRIVER" && (
          <Button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            Add Trip
          </Button>
          )}
      </div>

      <Input
        placeholder="Search trips..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <TripsList
        trips={filteredTrips}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEdit={(trip) => {
          setEditing(trip)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      {open && (
        <TripForm
          initialData={editing}
          onSave={handleSave}
          onClose={() => {
            setOpen(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
