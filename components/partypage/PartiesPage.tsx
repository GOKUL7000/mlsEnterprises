"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import PartiesForm from "./PartiesForm"
import PartiesList from "./PartiesList"
import { supabase } from "@/lib/supabase"
import { Input } from "../ui/input"
import { useAuth } from "@/hooks/useAuth"

export interface Party {
  partiesID: number
  companyID: string
  partyName: string
  partyMobileNumber: string
  partyAddress: string
  partyStatus: boolean
  createdBy: string
  partyGST: string
  partyPan: string

  tripCount?: number
  totalFreightAmount?: number
  pendingAmount?: number
  settledAmount?: number
}
export default function PartiesPage() {
  const { session, loading } = useAuth()

  const [parties, setParties] = useState<Party[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Party | null>(null)

  const [search, setSearch] = useState("")

  const filteredParties = parties
    .filter((p) => {
      const text = search.toLowerCase()

      return (
        p.partyName.toLowerCase().includes(text) ||
        p.partyMobileNumber.includes(text) ||
        p.partyAddress.toLowerCase().includes(text)
      )
    })
    .sort((a, b) => b.partiesID - a.partiesID)

  useEffect(() => {
    if (loading) return
    fetchParties()
  }, [session?.companyID, loading])

  const fetchParties = async () => {
    const { data: partiesData, error } = await supabase
      .from("partiesTable")
      .select("*")
      .eq("companyID", session?.companyID)
      .order("partiesID", { ascending: false })

    if (error) return

    const { data: tripsData } = await supabase
      .from("tripsTable")
      .select("partiesID, freightAmount, tripStatus")

    const partiesWithStats = (partiesData || []).map((party) => {
      const partyTrips =
        tripsData?.filter(
          (trip) => trip.partiesID === party.partiesID
        ) || []

      const totalFreightAmount = partyTrips.reduce(
        (sum, trip) => sum + Number(trip.freightAmount || 0),
        0
      )

      const pendingAmount = partyTrips
        .filter((trip) => trip.tripStatus === true)
        .reduce(
          (sum, trip) => sum + Number(trip.freightAmount || 0),
          0
        )

      const settledAmount = partyTrips
        .filter((trip) => trip.tripStatus === false)
        .reduce(
          (sum, trip) => sum + Number(trip.freightAmount || 0),
          0
        )

      return {
        ...party,
        tripCount: partyTrips.length,
        totalFreightAmount,
        pendingAmount,
        settledAmount,
      }
    })

    setParties(partiesWithStats)
  }

  const checkDuplicate = async (
    mobile: string,
    excludeId?: number
  ) => {
    let query = supabase
      .from("partiesTable")
      .select("partiesID")
      .eq("companyID", session?.companyID)
      .eq("partyMobileNumber", mobile)
      .eq("partyStatus", true)

    if (excludeId) {
      query = query.neq("partiesID", excludeId)
    }

    const { data } = await query.limit(1)

    return data && data.length > 0
  }

  const handleSave = async (party: Party) => {
    const isDuplicate = await checkDuplicate(
      party.partyMobileNumber,
      editing?.partiesID
    )

    if (isDuplicate) {
      toast.error("Mobile number already exists")
      return
    }

    if (editing) {
      const { error } = await supabase
        .from("partiesTable")
        .update({
          partyName: party.partyName,
          partyMobileNumber: party.partyMobileNumber,
          partyAddress: party.partyAddress,
          partyGST: party.partyGST,
          partyPan: party.partyPan,
        })
        .eq("partiesID", editing.partiesID)

      if (error) {
        console.error(error)
        toast.error("Failed to update party")
        return
      }

      toast.success("Party updated successfully")
    } else {
      const { error } = await supabase
        .from("partiesTable")
        .insert([
          {
            companyID: session?.companyID,
            partyName: party.partyName,
            partyMobileNumber: party.partyMobileNumber,
            partyAddress: party.partyAddress,
            partyGST: party.partyGST,
            partyPan: party.partyPan,
            partyStatus: true,
            createdBy: session?.userID,
          },
        ])

      if (error) {
        console.error(error)
        toast.error("Failed to add party")
        return
      }

      toast.success("Party added successfully")
    }

    setOpen(false)
    setEditing(null)
    fetchParties()
  }

  const handleDelete = async (partiesID: number) => {
    const confirmDelete = confirm("Are you sure you want to delete?")

    if (!confirmDelete) return

    const { error } = await supabase
      .from("partiesTable")
      .update({
        partyStatus: false,
      })
      .eq("partiesID", partiesID)

    if (error) {
      console.error(error)
      toast.error("Failed to delete party")
      return
    }

    toast.success("Party deleted successfully")
    fetchParties()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parties</h1>
          {/* <p className="text-muted-foreground text-sm">
            Manage all parties here.
          </p> */}
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Add Party
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search parties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PartiesList
        parties={filteredParties}
        onEdit={(party) => {
          setEditing(party)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      {open && (
        <PartiesForm
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
