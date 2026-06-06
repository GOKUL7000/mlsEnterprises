import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Phone } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

function IconWithBadge({
  count,
  children,
}: {
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {children}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </div>
  )
}

export function TaskTable({ tasks }: any) {
  const now = new Date()
  const { session } = useAuth()
  const router = useRouter()
  if (!session) return

  const tableName = `${session.companyName}LeadTable`

  const formatDateTime = (value: string) => {
      if (!value) return "-"

      const date = new Date(value)

      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()

      return `${day}-${month}-${year} `
    }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Sr.No.</th>
            <th className="p-3 text-left">Date(DD-MM-YYYY)</th>
            <th className="p-3 text-left">Task Name</th>
            <th className="p-3 text-left">Lead Name</th>
            <th className="p-3 text-left">Contact Number</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Assigned To</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task: any,index: number) => {
            const followUpDateTime = new Date(`${task.date}T${task.time}`)
            const isOverdue =
              !task.isCompleted && followUpDateTime < now

            return (
              
              <tr key={task.followUpID} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{formatDateTime(task.date)} : {task.time}</td>
                <td className="p-3">Reminder for {task.lead_name}</td>
                <td className="p-3">{task.lead_name}</td>
                <td className="p-3">{task.contact_number}</td>
                <td className="p-3">{task.notes}</td>
                <td className="p-3">{task.userTable?.name} </td>
                <td className="p-3">
                  {task.followUpStatus === false ? (
                    <button
                      className="px-3 py-1 rounded-md bg-green-500 text-white text-xs font-medium cursor-default"
                      disabled
                    >
                      Completed
                    </button>
                  ) : isOverdue ? (
                    <button
                      className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-medium"
                    >
                      Overdue
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-md bg-blue-500 text-white text-xs font-medium"
                    >
                      Open
                    </button>
                  )}
                </td>

                <td className="p-3">Reminder</td>
                <td className="p-3 text-right">
                    <div className="flex justify-end gap-3 ">
                      {/* Call */}
                      <IconWithBadge count={0}>
                        <button
                              onClick={() => router.push(`/leads/${task.leadID}`)}
                              className="hover:text-green-600"
                            >
                              <Phone className="h-4 w-4 text-green-600" />
                        </button>
                      </IconWithBadge>

                      
                      {/* View */}
                      <button className="hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button className="hover:text-indigo-600">
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button className="hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
              </tr>
            )
          })}
        </tbody>

        
      </table>

      
    </div>


      
   

  )
}


