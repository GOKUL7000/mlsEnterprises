import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Party } from "./PartiesPage"
import TablePagination from "@/components/common/TablePagination"
import { ITEMS_PER_PAGE } from "@/lib/tableperpage"
import { useRouter } from "next/navigation"

export default function PartiesList({
  parties,
  onEdit,
  onDelete,
}: {
  parties: Party[]
  onEdit: (party: Party) => void
  onDelete: (partiesID: number) => void
}) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(
    parties.length / ITEMS_PER_PAGE
  )

  const paginatedParties = parties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalParties = parties.length

  const totalTrips = parties.reduce(
    (sum, party) => sum + (party.tripCount || 0),
    0
  )

  const totalFreight = parties.reduce(
    (sum, party) => sum + (party.totalFreightAmount || 0),
    0
  )

  const totalPending = parties.reduce(
    (sum, party) => sum + (party.pendingAmount || 0),
    0
  )

  const totalSettled = parties.reduce(
    (sum, party) => sum + (party.settledAmount || 0),
    0
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [parties])

  if (parties.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No parties added yet.
      </p>
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">     

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Total Freight
        </p>
        <h3 className="text-2xl font-bold mt-2 text-blue-600">
          ₹{totalFreight.toLocaleString("en-IN")}
        </h3>
      </div>

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Pending Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-red-600">
          ₹{totalPending.toLocaleString("en-IN")}
        </h3>
      </div>

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Settled Amount
        </p>
        <h3 className="text-2xl font-bold mt-2 text-green-600">
          ₹{totalSettled.toLocaleString("en-IN")}
        </h3>
      </div>
      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Total Parties
        </p>
        <h3 className="text-2xl font-bold mt-2">
          {totalParties}
        </h3>
      </div>

      <div className="rounded-xl border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Total Trips
        </p>
        <h3 className="text-2xl font-bold mt-2">
          {totalTrips}
        </h3>
      </div>
    </div>
      <div className="rounded-xl border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Party Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Trip count</th>
              <th className="p-3 text-left">Total Freight</th> 
              <th className="p-3 text-left">Pending</th>
              <th className="p-3 text-left">Settled</th>          
              {/* <th className="p-3 text-left">Status</th> */}
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedParties.map((party) => (
              <tr
                key={party.partiesID}
                className="border-t"
              >
                <td className="p-3 font-medium">
                  <button
                    onClick={() =>
                      router.push(`/parties/${party.partiesID}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    {party.partyName}
                  </button>
                </td>

                <td className="p-3">
                  {party.partyMobileNumber}
                </td>

                <td className="p-3">
                  {party.partyAddress}
                </td>                

                <td className="p-3 text-left">
                  {party.tripCount}
                </td>

                <td className="p-3 text-left">
                   ₹{(Number(party.totalFreightAmount).toLocaleString("en-IN"))}
                </td>

               
                <td className="p-3 text-red-600 font-medium">
                  ₹{(Number(party.pendingAmount).toLocaleString("en-IN"))}
                </td>

                <td className="p-3 text-green-600 font-medium">
                  ₹{(Number(party.settledAmount).toLocaleString("en-IN"))}
                </td>

                {/* <td className="p-3">
                  {party.partyStatus ? (
                    <span className="text-green-600 font-medium">  
                        Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium"> 
                        Inactive
                    </span>
                  )}
                </td> */}

                <td className="p-3 text-right">
                  <button
                    onClick={() => onEdit(party)}
                    className="p-1 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(party.partiesID)}
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
