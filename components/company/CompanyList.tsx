
import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Company } from "./CompanyPage"
import TablePagination from "@/components/common/TablePagination"


const ITEMS_PER_PAGE = 3

export default function CompanyList({
  companies,
  onEdit,
  onDelete,
}: {
  companies: Company[]
  onEdit: (company: Company) => void
  onDelete: (id: number) => void
}) {

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(
    companies.length / ITEMS_PER_PAGE
  )

  const paginatedCompanies = companies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )  

  useEffect(() => {
    setCurrentPage(1)
  }, [companies])


  if (companies.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No companies added yet.
      </p>
    )
  }

  

  return (
    <>
    <div className="rounded-xl border bg-background overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Company</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedCompanies.map((company) => (
            <tr key={company.companyID} className="border-t">
              <td className="p-3">
                <p className="font-medium">{company.companyName}</p>
                <p className="text-xs text-muted-foreground">
                  {company.address}
                </p>
              </td>
              <td className="p-3">{company.email}</td>
              <td className="p-3">{company.phone}</td>
              {/* ✅ STATUS */}
              <td className="p-3">
                {company.companyStatus ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactive</span>
                )}
              </td>
              {/* ✅ ACTIONS */}
              <td className="p-3 text-right">
                {company.companyStatus && (
                  <>
                    <button
                      onClick={() => onEdit(company)}
                      className="p-1 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(company.companyID)}
                      className="p-1 ml-2 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* ✅ Reusable Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
    />
    </>
  )
}
