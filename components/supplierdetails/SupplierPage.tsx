"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import SuppliersList from "./SuppliersList"
import SupplierForm from "./SupplierForm"
import { useAuth } from "@/hooks/useAuth"

export type Supplier = {
  supplierID: number
  companyID: string
  supplierName: string
  supplierMobileNumber: string
  supplierAddress: string
  tripCount: number
  totalFreightAmount: number
  createdBy: string
  supplierStatus: boolean
}

export default function SupplierPage() {
  const { session, loading } = useAuth()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [search, setSearch] = useState("")

  const filteredSuppliers = suppliers.filter((s) => {
    const text = search.toLowerCase()

    return (
      s.supplierName.toLowerCase().includes(text) ||
      s.supplierMobileNumber.includes(text) ||
      s.supplierAddress.toLowerCase().includes(text)
    )
  })

  useEffect(() => {
    if (loading) return
    fetchSuppliers()
  }, [session?.companyID, loading])

  const fetchSuppliers = async () => {
    const { data: suppliersData, error } = await supabase
      .from("supplierTable")
      .select("*")
      .eq("companyID", session?.companyID)
      .eq("supplierStatus", true)
      .order("supplierID", { ascending: false })

    if (error) {
      console.error(error)
      toast.error("Failed to fetch suppliers")
      return
    }

    const { data: tripsData } = await supabase
      .from("tripsTable")
      .select("supplierID, freightAmount")

    const suppliersWithStats = (suppliersData || []).map((supplier) => {
      const supplierTrips =
        tripsData?.filter(
          (trip) => trip.supplierID === supplier.supplierID
        ) || []

      return {
        ...supplier,
        tripCount: supplierTrips.length,
        totalFreightAmount: supplierTrips.reduce(
          (sum, trip) => sum + Number(trip.freightAmount || 0),
          0
        ),
      }
    })

    setSuppliers(suppliersWithStats)
  }
  const checkDuplicate = async (
    mobile: string,
    excludeID?: number
  ) => {
    let query = supabase
      .from("supplierTable")
      .select("supplierID")
      .eq("companyID", session?.companyID)
      .eq("supplierMobileNumber", mobile)
      .eq("supplierStatus", true)

    if (excludeID) {
      query = query.neq("supplierID", excludeID)
    }

    const { data } = await query.limit(1)

    return data && data.length > 0
  }

  const handleSave = async (supplier: Supplier) => {
    const duplicate = await checkDuplicate(
      supplier.supplierMobileNumber,
      editing?.supplierID
    )

    if (duplicate) {
      toast.error("Mobile number already exists")
      return
    }

    if (editing) {
      const { error } = await supabase
        .from("supplierTable")
        .update({
          supplierName: supplier.supplierName,
          supplierMobileNumber:
            supplier.supplierMobileNumber,
          supplierAddress: supplier.supplierAddress,
        })
        .eq("supplierID", editing.supplierID)

      if (error) {
        console.error(error)
        toast.error("Failed to update supplier")
        return
      }

      toast.success("Supplier updated successfully")
    } else {
      const { error } = await supabase
        .from("supplierTable")
        .insert([
          {
            companyID: session?.companyID,
            supplierName: supplier.supplierName,
            supplierMobileNumber:
              supplier.supplierMobileNumber,
            supplierAddress: supplier.supplierAddress,
            createdBy: session?.userID,
            supplierStatus: true,
          },
        ])

      if (error) {
        console.error(error)
        toast.error("Failed to add supplier")
        return
      }

      toast.success("Supplier added successfully")
    }

    setOpen(false)
    setEditing(null)
    fetchSuppliers()
  }

  const handleDelete = async (supplierID: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("supplierTable")
      .update({
        supplierStatus: false,
      })
      .eq("supplierID", supplierID)

    if (error) {
      console.error(error)
      toast.error("Failed to delete supplier")
      return
    }

    toast.success("Supplier deleted successfully")
    fetchSuppliers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Suppliers
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage suppliers here.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Add Supplier
        </Button>
      </div>

      <Input
        placeholder="Search suppliers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <SuppliersList
        suppliers={filteredSuppliers}
        onEdit={(supplier) => {
          setEditing(supplier)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      {open && (
        <SupplierForm
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