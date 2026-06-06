"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

import TruckForm from "./TruckForm"
import TrucksList from "./TrucksList"

export type Truck = {
  truckID: number
  companyID: string

  truckNumber: string
  truckType: string
  truckModel: string
  truckCapacity: string
  truckBodyLength: string

  ownershipType: "Market Truck" | "My Truck"

  supplierID: string
  driverID: string
    supplierName?: string
    driverName?: string

  createdBy: string
  truckStatus: boolean
}

export default function TruckPage() {
  const { session, loading } = useAuth()

  const [trucks, setTrucks] = useState<Truck[]>([])

  const [open, setOpen] = useState(false)

  const [editing, setEditing] =
    useState<Truck | null>(null)

  const [search, setSearch] = useState("")

  const filteredTrucks = trucks.filter((t) => {
    const text = search.toLowerCase()

    return (
      t.truckNumber.toLowerCase().includes(text) ||
      t.truckType.toLowerCase().includes(text) ||
      t.ownershipType.toLowerCase().includes(text) ||
      t.supplierName?.toLowerCase().includes(text) ||
      t.driverName?.toLowerCase().includes(text)
    )
  })

  useEffect(() => {
    if (loading) return
    fetchTrucks()
  }, [session?.companyID, loading])

  const fetchTrucks = async () => {
  const { data: truckData, error } =
    await supabase
      .from("trucksTable")
      .select("*")
      .eq(
        "companyID",
        session?.companyID
      )
      .eq("truckStatus", true)
      .order("truckID", {
        ascending: false,
      })

  if (error) {
    console.error(error)
    toast.error("Failed to fetch trucks")
    return
  }

  const { data: supplierData } =
    await supabase
      .from("supplierTable")
      .select(
        "supplierID, supplierName"
      )

  const { data: driverData } =
    await supabase
      .from("driversTable")
      .select(
        "driverID, driverName"
      )

  const updatedTrucks =
    (truckData || []).map((truck) => {
      const supplier =
        supplierData?.find(
          (s) =>
            s.supplierID ===
            truck.supplierID
        )

      const driver =
        driverData?.find(
          (d) =>
            d.driverID ===
            truck.driverID
        )

      return {
        ...truck,

        supplierName:
          supplier?.supplierName ||
          "",

        driverName:
          driver?.driverName || "",
      }
    })

  setTrucks(updatedTrucks)
}

  const handleSave = async (truck: Truck) => {
    if (editing) {
      const { error } = await supabase
        .from("trucksTable")
        .update({
          truckNumber: truck.truckNumber,
          truckType: truck.truckType,
          truckModel: truck.truckModel,
          truckCapacity: truck.truckCapacity,
          truckBodyLength: truck.truckBodyLength,
          ownershipType: truck.ownershipType,
            supplierID:
                truck.ownershipType ===
                "Market Truck" &&
                truck.supplierID
                ? (truck.supplierID)
                : null,
            driverID:  
                truck.ownershipType ===
                "My Truck" &&
                truck.driverID
                ? (truck.driverID)
                : null,
        })
        .eq("truckID", editing.truckID)

      if (error) {
        console.error(error)
        toast.error("Failed to update truck")
        return
      }

      toast.success("Truck updated successfully")
    } else {
        
        const { error } = await supabase
        .from("trucksTable")
        .insert([
            {
            companyID:
                session?.companyID || null,

            truckNumber: truck.truckNumber,
            truckType: truck.truckType,

            truckModel: truck.truckModel,
            truckCapacity:
                truck.truckCapacity,
            truckBodyLength:
                truck.truckBodyLength,

            ownershipType:
                truck.ownershipType,

            supplierID:
                truck.ownershipType ===
                "Market Truck" &&
                truck.supplierID
                ? (truck.supplierID)
                : null,

            driverID:
                truck.ownershipType ===
                "My Truck" &&
                truck.driverID
                ? (truck.driverID)
                : null,

            createdBy:
                session?.userID || null,

            truckStatus: true,
            },
        ])

      if (error) {
        console.error(error)
        toast.error("Failed to add truck")
        return
      }

      toast.success("Truck added successfully")
    }

    setOpen(false)
    setEditing(null)

    fetchTrucks()
  }

  const handleDelete = async (
    truckID: number
  ) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("trucksTable")
      .update({
        truckStatus: false,
      })
      .eq("truckID", truckID)

    if (error) {
      console.error(error)
      toast.error("Failed to delete truck")
      return
    }

    toast.success("Truck deleted successfully")

    fetchTrucks()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Trucks
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage trucks here.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Add Truck
        </Button>
      </div>

      <Input
        placeholder="Search trucks..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <TrucksList
        trucks={filteredTrucks}
        onEdit={(truck) => {
          setEditing(truck)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      {open && (
        <TruckForm
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