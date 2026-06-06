import { useEffect, useState } from "react"
import { Driver } from "./DriverPage"
import TablePagination from "@/components/common/TablePagination"
import { ITEMS_PER_PAGE } from "@/lib/tableperpage"
import {
  Pencil,
  Trash2,
  Users,
  Truck,
  IndianRupee,
  CheckCircle,
  UserCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DriversList({
  drivers,
  onEdit,
  onDelete,
}: {
  drivers: Driver[]
  onEdit: (driver: Driver) => void
  onDelete: (driverID: number) => void
}) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(
    drivers.length / ITEMS_PER_PAGE
  )

  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalDrivers = drivers.length

const totalTrips = drivers.reduce(
  (sum, driver) => sum + (driver.tripCount || 0),
  0
)

const totalFreight = drivers.reduce(
  (sum, driver) =>
    sum + (driver.totalFreightAmount || 0),
  0
)

const activeDrivers = drivers.filter(
  (driver) => driver.driverStatus
).length

const inactiveDrivers = drivers.filter(
  (driver) => !driver.driverStatus
).length

  useEffect(() => {
    setCurrentPage(1)
  }, [drivers])

  if (drivers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No drivers added yet.
      </p>
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Freight
            </p>
            <h3 className="text-2xl font-bold mt-2 text-green-600">
              ₹{totalFreight.toLocaleString("en-IN")}
            </h3>
          </div>
          <IndianRupee className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Drivers
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {totalDrivers}
            </h3>
          </div>
          <Users className="h-8 w-8 text-blue-600" />
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
          <Truck className="h-8 w-8 text-orange-600" />
        </div>
      </div>

  

  {/* <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Active Drivers
        </p>
        <h3 className="text-2xl font-bold mt-2 text-green-600">
          {activeDrivers}
        </h3>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
    </div>
  </div>

  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Inactive Drivers
        </p>
        <h3 className="text-2xl font-bold mt-2 text-red-600">
          {inactiveDrivers}
        </h3>
      </div>
      <UserCheck className="h-8 w-8 text-red-600" />
    </div>
  </div> */}

</div>
      <div className="rounded-xl border overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">
                Driver Name
              </th>

              <th className="p-3 text-left">
                Mobile
              </th>

              <th className="p-3 text-left">
                License Number
              </th>

              <th className="p-3 text-left">
                Address
              </th>
              <th className="p-3 text-left">Trip count</th>
              <th className="p-3 text-left">Total Freight</th> 
              <th className="p-3 text-left">
                status  
              </th>
              <th className="p-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedDrivers.map((driver) => (
              <tr
                key={driver.driverID}
                className="border-t"
              >
                <td className="p-3 font-medium">
                  <button
                    onClick={() =>
                      router.push(`/drivers/${driver.driverID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {driver.driverName}
                  </button>
                </td>

                <td className="p-3">
                  {driver.driverMobileNumber}
                </td>

                <td className="p-3">
                  {driver.licenseNumber}
                </td>

                <td className="p-3">
                  {driver.driverAddress}
                </td>
                <td className="p-3">
                  {driver.tripCount}
                </td>
                <td className="p-3">
                   ₹ {(Number(driver.totalFreightAmount).toLocaleString("en-IN"))}
                </td>
                <td className="p-3">
                  {driver.driverStatus ? (
                    <span className="text-green-600 font-medium">
                        Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                        Inactive
                    </span>
                    )}
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() => onEdit(driver)}
                    className="p-1 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      onDelete(driver.driverID)
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