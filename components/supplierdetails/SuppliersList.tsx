import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Supplier } from "./SupplierPage"
import TablePagination from "@/components/common/TablePagination"
import { ITEMS_PER_PAGE } from "@/lib/tableperpage"
import {
  Building2,
  Truck,
  IndianRupee,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SuppliersList({
  suppliers,
  onEdit,
  onDelete,
}: {
  suppliers: Supplier[]
  onEdit: (supplier: Supplier) => void
  onDelete: (supplierID: number) => void
}) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(
    suppliers.length / ITEMS_PER_PAGE
  )

  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalSuppliers = suppliers.length

const totalTrips = suppliers.reduce(
  (sum, supplier) => sum + (supplier.tripCount || 0),
  0
)

const totalFreight = suppliers.reduce(
  (sum, supplier) =>
    sum + (supplier.totalFreightAmount || 0),
  0
)

const activeSuppliers = suppliers.filter(
  (supplier) => supplier.supplierStatus
).length

const inactiveSuppliers = suppliers.filter(
  (supplier) => !supplier.supplierStatus
).length

  useEffect(() => {
    setCurrentPage(1)
  }, [suppliers])

  if (suppliers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No suppliers added yet.
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
              Total Suppliers
            </p>
            <h3 className="text-2xl font-bold mt-2">
              {totalSuppliers}
            </h3>
          </div>
          <Building2 className="h-8 w-8 text-blue-600" />
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

      
      

    </div>
      <div className="rounded-xl border overflow-hidden bg-background">
        
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">
                Supplier Name
              </th>

              <th className="p-3 text-left">
                Mobile
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
            {paginatedSuppliers.map((supplier) => (
              <tr
                key={supplier.supplierID}
                className="border-t"
              >
                <td className="p-3 font-medium">
                  <button
                    onClick={() =>
                      router.push(`/suppliers/${supplier.supplierID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {supplier.supplierName}
                  </button>
                  
                </td>

                <td className="p-3">
                  {supplier.supplierMobileNumber}
                </td>

                <td className="p-3">
                  {supplier.supplierAddress}
                </td>
                <td className="p-3">
                  {supplier.tripCount}
                </td>
                <td className="p-3">
                  ₹{Number(supplier.totalFreightAmount).toLocaleString("en-IN")}
                </td>
                <td className="p-3">
                  {supplier.supplierStatus ? (
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
                    onClick={() => onEdit(supplier)}
                    className="p-1 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      onDelete(supplier.supplierID)
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