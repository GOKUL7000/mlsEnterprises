import { useEffect, useState } from "react"

import {
  Eye,
  Pencil,
  Trash2,
  Truck,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Package,
  Route,
} from "lucide-react"

import TablePagination from "@/components/common/TablePagination"
import { ITEMS_PER_PAGE } from "@/lib/tableperpage"

import { Trip } from "./TripPage"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function TripsList({
  trips,
  activeTab,
  setActiveTab,
  onEdit,
  onDelete,
}: {
  trips: Trip[]
  activeTab: "PENDING" | "COMPLETED"
  setActiveTab: (
    tab: "PENDING" | "COMPLETED"
  ) => void
  onEdit: (trip: Trip) => void
  onDelete: (tripID: number) => void
}) {
  const { session } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] =
    useState(1)

    

  const totalPages = Math.ceil(
    trips.length / ITEMS_PER_PAGE
  )

  const paginatedTrips = trips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
const totalTrips = trips.length

const totalFreight = trips.reduce(
  (sum, trip) =>
    sum + Number(trip.freightAmount || 0),
  0
)

const totalExpenses = trips.reduce(
  (sum, trip) =>
    sum + Number(trip.totalExpense || 0),
  0
)

const netProfit = trips.reduce(
  (sum, trip) =>
    sum + Number(trip.profit || 0),
  0
)

const pendingAmount = trips
  .filter((trip) => trip.tripStatus === true)
  .reduce(
    (sum, trip) =>
      sum + Number(trip.freightAmount || 0),
    0
  )

const settledAmount = trips
  .filter((trip) => trip.tripStatus === false)
  .reduce(
    (sum, trip) =>
      sum + Number(trip.freightAmount || 0),
    0
  )

const marketTrips = trips.filter(
  (trip) =>
    trip.ownershipType === "Market Truck"
).length

const ownTrips = trips.filter(
  (trip) =>
    trip.ownershipType !== "Market Truck"
).length

  useEffect(() => {
    setCurrentPage(1)
  }, [trips])

  if (trips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No trips added yet.
      </p>
    )
  }

  return (
    <>

    <div className="flex gap-2">
      <button
        onClick={() => setActiveTab("PENDING")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          activeTab === "PENDING"
            ? "bg-orange-500 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        Pending Trips
      </button>

      <button
        onClick={() => setActiveTab("COMPLETED")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          activeTab === "COMPLETED"
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        Completed Trips
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 mb-6">

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
      <Route className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Freight Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">
          ₹{totalFreight.toLocaleString("en-IN")}
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
          ₹{pendingAmount.toLocaleString("en-IN")}
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
          ₹{settledAmount.toLocaleString("en-IN")}
        </h3>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">
        Total Expenses
      </p>
      <h3 className="text-2xl font-bold mt-2 text-red-600">
        ₹{totalExpenses.toLocaleString("en-IN")}
      </h3>
    </div>
  </div>
</div>

<div className="rounded-2xl border bg-white p-4 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">
        Net Profit
      </p>
      <h3 className="text-2xl font-bold mt-2 text-green-600">
        ₹{netProfit.toLocaleString("en-IN")}
      </h3>
    </div>
  </div>
</div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Own Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">
          {ownTrips}
        </h3>
      </div>
      <Truck className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Market Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-orange-600">
          {marketTrips}
        </h3>
      </div>
      <Package className="h-8 w-8 text-orange-600" />
    </div>
  </div>

</div>
      <div className="rounded-xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Date
              </th>
              
              <th className="p-4 text-left">
                Parties
              </th>

              <th className="p-4 text-left">
                Truck
              </th>

              <th className="p-4 text-left">
                Driver
              </th>
              <th className="p-4 text-left">
                Route
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Expences
              </th>

              <th className="p-4 text-left">
                Net Profit
              </th>
              
              <th className="p-4 text-right">
                Actions
              </th>
              
            </tr>
          </thead>

          <tbody>
            {paginatedTrips.map((trip) => (
              <tr
                key={trip.tripID}
                className="border-t"
              >
                <td className="p-4">
                  {new Date(trip.startDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                </td>
                <td className="p-4 font-medium">
                  <button
                    onClick={() =>
                      router.push(`/parties/${trip.partiesID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {trip.partyName}
                  </button>
                  
                </td>

                <td className="p-4">
                  {trip.truckNumber} <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide text-white
                        
                        ${
                            trip.ownershipType ===
                            "Market Truck"
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        }
                        `}
                        >
                        {trip.ownershipType ===
                        "Market Truck"
                            ? "MARKET"
                            : "OWN"}
                        </span>
                </td>

                <td className="p-4">
                  <button
                    onClick={() =>
                      router.push(`/suppliers/${trip.supplierID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {trip.supplierName}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/drivers/${trip.driverID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {trip.driverName}
                  </button>
                </td>

                <td className="p-4">
                  {trip.origin} → {trip.destination}
                </td>                

                <td className="p-4 text-blue-600 font-medium">
                   ₹ {(Number(trip.freightAmount).toLocaleString("en-IN"))}
                </td>

                <td className="p-4 text-red-600 font-medium ">
                  ₹{Number(
                    trip.totalExpense || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="p-4 text-green-600 font-medium" >
                  ₹{Number(
                    trip.profit || 0
                  ).toLocaleString("en-IN")}
                </td>

                
                
                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      router.push(
                        `/trips/${trip.tripID}`
                      )
                    }
                    className="p-1 hover:text-blue-600"
                  >
                    <Eye size={16} />
                  </button>

                  {/* <button
                    onClick={() =>
                      onEdit(trip)
                    }
                    className="p-1 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button> */}
                  
                   {session?.role !== "DRIVER" &&
                        activeTab === "PENDING" && (
                          <button
                            onClick={() =>
                              onDelete(trip.tripID)
                            }
                            className="p-1 ml-2 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                      )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}
