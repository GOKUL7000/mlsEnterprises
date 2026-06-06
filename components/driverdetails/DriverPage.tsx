"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import DriverForm from "./DriverForm"
import DriversList from "./DriversList"
import { useAuth } from "@/hooks/useAuth"
import bcrypt from "bcryptjs"

export type Driver = {
  driverID: number
  companyID: string
  driverName: string
  driverMobileNumber: string
  driverAddress: string
  licenseNumber: string
  createdBy: string
  driverStatus: boolean
  tripCount: number
  totalFreightAmount: number

  password: string
}

export default function DriverPage() {
  const { session, loading } = useAuth()

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] =
    useState<Driver | null>(null)

  const [search, setSearch] = useState("")

  const filteredDrivers = drivers.filter((d) => {
    const text = search.toLowerCase()

    return (
      d.driverName.toLowerCase().includes(text) ||
      d.driverMobileNumber.includes(text) ||
      d.licenseNumber.toLowerCase().includes(text)
    )
  })

  useEffect(() => {
    if (loading) return
    fetchDrivers()
  }, [session?.companyID, loading])

  const fetchDrivers = async () => {
    const { data: driversData, error } = await supabase
      .from("driversTable")
      .select("*")
      .eq("companyID", session?.companyID)
      .eq("driverStatus", true)
      .order("driverID", { ascending: false })

    if (error) {
      console.error(error)
      toast.error("Failed to fetch drivers")
      return
    }

    const { data: tripsData } = await supabase
      .from("tripsTable")
      .select("driverID, freightAmount")

    const driversWithStats = (driversData || []).map((driver) => {
      const driverTrips =
        tripsData?.filter(
          (trip) => trip.driverID === driver.driverID
        ) || []

      return {
        ...driver,
        tripCount: driverTrips.length,
        totalFreightAmount: driverTrips.reduce(
          (sum, trip) => sum + Number(trip.freightAmount || 0),
          0
        ),
      }
    })

    setDrivers(driversWithStats)
  }

  const checkDuplicate = async (
    mobile: string,
    excludeID?: number
  ) => {
    let query = supabase
      .from("driversTable")
      .select("driverID")
      .eq("companyID", session?.companyID)
      .eq("driverMobileNumber", mobile)
      .eq("driverStatus", true)

    if (excludeID) {
      query = query.neq("driverID", excludeID)
    }

    const { data } = await query.limit(1)

    return data && data.length > 0
  }

  const checkDuplicateUsername = async (
    username: string,
    excludeUserID?: number
  ) => {
    let query = supabase
      .from("loginTable")
      .select("userID")
      .eq("username", username.toLowerCase())
      .eq("status", true)

    if (excludeUserID) {
      query = query.neq("userID", excludeUserID)
    }

    const { data } = await query.limit(1)

    return data && data.length > 0
  }

  const handleSave = async (driver: Driver) => {
    const duplicate = await checkDuplicate(
      driver.driverMobileNumber,
      editing?.driverID
    )

    if (duplicate) {
      toast.error("Mobile number already exists")
      return
    }

    const username = driver.driverName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")

      const duplicateUsername =
        await checkDuplicateUsername(username)

      if (duplicateUsername) {
        toast.error("Username already exists")
        return
      }

      const hashedPassword = await bcrypt.hash(driver.password, 10)

    if (editing) {
      const { error } = await supabase
        .from("driversTable")
        .update({
          driverName: driver.driverName,
          driverMobileNumber:
            driver.driverMobileNumber,
          driverAddress: driver.driverAddress,
          licenseNumber: driver.licenseNumber,
        })
        .eq("driverID", editing.driverID)

        const { data: loginData, error: loginError } =
        await supabase
          .from("loginTable")
          .update({
            password: hashedPassword,
          })
          .eq("username", username)
          .eq("role", "DRIVER")
          .eq("status", true)
          .single()

          
      if (error) {
        console.error(error)
        toast.error("Failed to update driver")
        return
      }

      toast.success("Driver updated successfully")
    } else {

      

      // 1. Create User
      const { data: userData, error: userError } =
        await supabase
          .from("userTable")
          .insert([
            {
              companyID: session?.companyID,
              name: driver.driverName,
              phone: driver.driverMobileNumber,
              email: null,
              userStatus: true,
            },
          ])
          .select()
          .single()

      if (userError) {
        toast.error("Failed to create user")
        return
      }
      

      

      // 2. Create Login
      const { error: loginError } = await supabase
        .from("loginTable")
        .insert([
          {
            userID: userData.userID,
            username,
            password: hashedPassword,
            role: "DRIVER",
            status: true,
          },
        ])

      if (loginError) {
        toast.error("Failed to create login")
        return
      }

      // 3. Create Driver
      const { error: driverError  } = await supabase
        .from("driversTable")
        .insert([
          {
            companyID: session?.companyID,
            driverName: driver.driverName,
            driverMobileNumber:driver.driverMobileNumber,
            driverAddress: driver.driverAddress,
            licenseNumber: driver.licenseNumber,
            createdBy: session?.userID,
            driverStatus: true,
          },
        ])

      if (driverError ) {
        console.error(driverError )
        toast.error("Failed to add driver")
        return
      }

      toast.success("Driver added successfully")
    }

    setOpen(false)
    setEditing(null)
    fetchDrivers()
  }

  const handleDelete = async (driverID: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("driversTable")
      .update({
        driverStatus: false,
      })
      .eq("driverID", driverID)

    if (error) {
      console.error(error)
      toast.error("Failed to delete driver")
      return
    }

    toast.success("Driver deleted successfully")
    fetchDrivers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Drivers
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage drivers here.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Add Driver
        </Button>
      </div>

      <Input
        placeholder="Search drivers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DriversList
        drivers={filteredDrivers}
        onEdit={(driver) => {
          setEditing(driver)
          setOpen(true)
        }}
        onDelete={handleDelete}
      />

      {open && (
        <DriverForm
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