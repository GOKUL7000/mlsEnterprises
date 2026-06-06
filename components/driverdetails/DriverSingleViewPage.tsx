"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trip } from "../tripdetails/TripPage"
import {
  Truck,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Package,
  Wallet,
} from "lucide-react"

export default function DriverSingleViewPage() {
  const params = useParams()
  const driverID = params.id

  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    fetchTrips()
  }, [])


  const totalTrips = trips.length

const totalFreight = trips.reduce(
  (sum, trip) => sum + Number(trip.freightAmount || 0),
  0
)

const pendingAmount = trips
  .filter((trip: any) => trip.tripStatus === true)
  .reduce(
    (sum, trip) =>
      sum + Number(trip.freightAmount || 0),
    0
  )

const settledAmount = trips
  .filter((trip: any) => trip.tripStatus === false)
  .reduce(
    (sum, trip) =>
      sum + Number(trip.freightAmount || 0),
    0
  )

const unpaidTrips = trips.filter(
  (trip: any) => trip.tripStatus === true
).length

const paidTrips = trips.filter(
  (trip: any) => trip.tripStatus === false
).length

  const fetchTrips = async () => {
   const [{ data ,error }, { data: driverData }] =
        await Promise.all([
          supabase
            .from("tripsTable")
            .select(`
              *,
              trucksTable (
                truckNumber,
                ownershipType
              )
            `)
            .eq("driverID", driverID),

          supabase
            .from("driversTable")
            .select("driverID, driverName")
        ])
      if (error) {
        console.error("Error fetching trips:", error)
        return
      }

      
    

    const updatedTrips =
      (data || []).map((trip) => {
        const startDate = new Date(
          trip.startDate
        )
        
         const driver = driverData?.find(
                (d) => d.driverID === trip.driverID
            )

        if (!trip.endDate) {
          return {
            ...trip,
            driverName: driver?.driverName || "",
             paymentStatus: trip.tripStatus
            ? "UNPAID"
            : "PAID",
          }
        }
        const endDate = new Date(
          trip.endDate
        )

        const today = new Date()

        const pendingDays = Math.floor(
          (today.getTime() -
            endDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )

        return {
          ...trip,
          driverName: driver?.driverName || "",
              
          paymentStatus: trip.tripStatus
            ? "UNPAID"
            : "PAID",
          pendingDays:
            trip.tripStatus
              ? pendingDays
              : 0,
        }
      })

      
      

    setTrips(updatedTrips)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Details for{" "}
        {trips.length > 0 && trips[0].driverName
          ? `${trips[0].driverName}`
          : "Supplier Details"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

  

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Freight Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">
          ₹{totalFreight.toLocaleString()}
        </h3>
      </div>
      <IndianRupee className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Pending Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-red-600">
          ₹{pendingAmount.toLocaleString()}
        </h3>
      </div>
      <AlertCircle className="h-8 w-8 text-red-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Settled Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-green-600">
          ₹{settledAmount.toLocaleString()}
        </h3>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Total Trips
        </p>
        <h3 className="text-2xl font-bold mt-2">
          {totalTrips}
        </h3>
      </div>
      <Truck className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Paid Trips
        </p>
        <h3 className="text-2xl font-bold mt-2 text-green-600">
          {paidTrips}
        </h3>
      </div>
      <Wallet className="h-8 w-8 text-green-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Unpaid Trips
        </p>
        <h3 className="text-2xl font-bold mt-2 text-red-600">
          {unpaidTrips}
        </h3>
      </div>
      <Package className="h-8 w-8 text-red-600" />
    </div>
  </div>

</div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              
              <th className="p-3 text-left">
                Start Date
              </th>
              <th className="p-3 text-left">
                End Date
              </th>
              <th className="p-3 text-left">
                Truck Number
              </th>
              <th className="p-3 text-left">
                Route
              </th>
              <th className="p-3 text-left">
                Freight Amount
              </th>
              <th className="p-3 text-left">
                Payment Status
              </th>
              <th className="p-3 text-left">
                Pending Days
              </th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip: any) => (
              <tr
                key={trip.tripID}
                className="border-t"
              >               

                <td className="p-3">
                  {new Date(trip.startDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                </td>
                <td className="p-3">
                    {trip.endDate
                    ? new Date(trip.endDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </td>
                <td className="p-4">
                    {trip.trucksTable
                        ? trip.trucksTable.truckNumber
                        : "N/A"} &nbsp;  
                        <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide text-white
                        
                        ${
                            trip.trucksTable.ownershipType ===
                            "Market Truck"
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        }
                        `}
                        >
                        {trip.trucksTable.ownershipType ===
                        "Market Truck"
                            ? "MARKET"
                            : "OWN"}
                        </span>
                </td>
                
                <td className="p-3">
                  {trip.origin} - {trip.destination}
                </td>
                <td className="p-3">
                   ₹{(Number(trip.freightAmount).toLocaleString("en-IN"))}
                </td>

                <td className="p-3">
                  {trip.paymentStatus ===
                  "PAID" ? (
                    <span className="text-green-600 font-medium">
                      Paid
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Unpaid
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {trip.pendingDays > 0
                    ? `${trip.pendingDays} Days`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}