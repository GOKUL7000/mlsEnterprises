import { useEffect, useState } from "react"

import {
  Pencil,
  Trash2,
  Truck as TruckIcon,
  Warehouse,
  CircleDollarSign,
} from "lucide-react"

import { Truck } from "./TruckPage"

import TablePagination from "@/components/common/TablePagination"

import { ITEMS_PER_PAGE } from "@/lib/tableperpage"
import { useRouter } from "next/navigation"

export default function TrucksList({
  trucks,
  onEdit,
  onDelete,
}: {
  trucks: Truck[]
  onEdit: (truck: Truck) => void
  onDelete: (truckID: number) => void
}) {
  const router = useRouter()
  const [currentPage, setCurrentPage] =
    useState(1)

  const totalPages = Math.ceil(
    trucks.length / ITEMS_PER_PAGE
  )

  const paginatedTrucks = trucks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalTrucks = trucks.length

const marketTrucks = trucks.filter(
  (truck) =>
    truck.ownershipType === "Market Truck"
).length

const ownTrucks = trucks.filter(
  (truck) =>
    truck.ownershipType !== "Market Truck"
).length

const supplierAttached = trucks.filter(
  (truck) => truck.supplierName
).length

const driverAttached = trucks.filter(
  (truck) => truck.driverName
).length

  useEffect(() => {
    setCurrentPage(1)
  }, [trucks])

  if (trucks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No trucks added yet.
      </p>
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Total Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2">
          {totalTrucks}
        </h3>
      </div>
      <TruckIcon className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Own Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">
          {ownTrucks}
        </h3>
      </div>
      <Warehouse className="h-8 w-8 text-blue-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Market Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-orange-600">
          {marketTrucks}
        </h3>
      </div>
      <TruckIcon className="h-8 w-8 text-orange-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Supplier Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-green-600">
          {supplierAttached}
        </h3>
      </div>
      <CircleDollarSign className="h-8 w-8 text-green-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Driver Trucks
        </p>
        <h3 className="text-2xl font-bold mt-2 text-purple-600">
          {driverAttached}
        </h3>
      </div>
      <TruckIcon className="h-8 w-8 text-purple-600" />
    </div>
  </div>

</div>
      <div className="rounded-xl border overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">
                Truck Number
              </th>

              <th className="p-3 text-left">
                Supplier / Driver
              </th>

              <th className="p-3 text-left">
                Truck Type
              </th>

              <th className="p-3 text-left">
                Model,Capacity and Body Type
              </th>

              <th className="p-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedTrucks.map((truck) => (
              <tr
                key={truck.truckID}
                className="border-t"
              >
                <td className="p-3">
                    <div className="flex items-center gap-2">
                        
                        <span className="font-semibold text-gray-800 tracking-wide uppercase">
                        {truck.truckNumber}
                        </span>

                        <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide text-white
                        
                        ${
                            truck.ownershipType ===
                            "Market Truck"
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        }
                        `}
                        >
                        {truck.ownershipType ===
                        "Market Truck"
                            ? "MARKET"
                            : "OWN"}
                        </span>
                    </div>
                </td>

                <td className="p-3">
                    
                      <button
                    onClick={() =>
                      router.push(`/suppliers/${truck.supplierID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {truck.supplierName}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/drivers/${truck.driverID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {truck.driverName}
                  </button>
                       
                        
                    
                    
                </td>

                <td className="p-3">
                  {truck.truckType}
                </td>

                <td className="p-3">
                  {truck.truckModel} - {truck.truckCapacity} - {truck.truckBodyLength}
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() => onEdit(truck)}
                    className="p-1 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      onDelete(truck.truckID)
                    }
                    className="p-1 ml-2 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
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