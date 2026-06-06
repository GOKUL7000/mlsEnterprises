
import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { User } from "./UsersPage"
import { Company } from "@/components/company/CompanyPage"
import TablePagination from "@/components/common/TablePagination"
import { useAuth } from "@/hooks/useAuth";
import { ITEMS_PER_PAGE } from "@/lib/tableperpage"


export default function UsersList({
  users,
  companies,
  onEdit,
  onDelete,
}: {
  users: User[]
  companies: Company[]
  onEdit: (user: User) => void
  onDelete: (userID: number) => void
}) {
  const { role, loading } = useAuth()
  const getCompanyName = (companyID: string) =>
    companies.find((c) => String(c.companyID) === companyID)?.companyName ?? "—"

  const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(
      users.length / ITEMS_PER_PAGE
    )
  
    const paginatedUsers = users.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )  
  
    useEffect(() => {
      setCurrentPage(1)
    }, [users])
  

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No users added yet.
      </p>
    )
  }

  return (
    <>
    <div className="rounded-xl border bg-background overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">UserName</th>
            <th className="p-3 text-left">Role</th>
            {role === "SUPER_ADMIN" && (
              <th className="p-3 text-left">Company</th>
            )}
            <th className="p-3 text-left">Mobile</th>
            {/* <th className="p-3 text-left">Status</th> */}
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.userID} className="border-t">
              <td className="p-3">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  Email: {user.email}
                </p>
              </td>
              <td className="p-3"> {user.name.toLowerCase()}</td>
              <td className="p-3">{user.role}</td>
              {role === "SUPER_ADMIN" && (
              <td className="p-3">{getCompanyName(user.companyID)}</td>
              )}
              <td className="p-3">{user.phone}</td>
              {/* <td className="p-3">
                {user.userStatus ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </td> */}
              <td className="p-3 text-right">
                 {user.userStatus && (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(user.userID)}
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
