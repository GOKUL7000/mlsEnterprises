"use client"

import { useState } from "react"
import {
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
} from "lucide-react"

/* ---------- STATS ---------- */
const stats = [
  {
    title: "Leads Generated",
    value: "500",
    trend: "up",
    icon: Users,
  },
  {
    title: "Qualified Leads",
    value: "150",
    trend: "down",
    icon: UserCheck,
  },
  {
    title: "Deals Closed",
    value: "100",
    trend: "up",
    icon: Briefcase,
  },
  {
    title: "Revenue Generated",
    value: "100",
    trend: "up",
    icon: DollarSign,
  },
]

/* ---------- COMPANIES ---------- */
const companies = [
  { companyID: 1, companyName: "SimpleHunt" },
  { companyID: 2, companyName: "GreenLands Arce" },
  { companyID: 3, companyName: "Capsule" },
]

/* ---------- COMPANY DETAILS ---------- */
const companyDetails: Record<number, any> = {
  1: {
    segments: ["Unlimited"],
    sources: ["Unlimited"],
    status: ["Unlimited"],
  },
  2: {
    segments: ["10"],
    sources: ["10"],
    status: ["10"],
  },
  3: {
    segments: ["10"],
    sources: ["10"],
    status: ["10"],
  },
}

// /* ---------- LEADS ---------- */
// const leads = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john@example.com",
//     mobile: "9876543210",
//     company: "ABC Corp",
//     status: "Not Interested",
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane@company.com",
//     mobile: "9123456789",
//     company: "XYZ Ltd",
//     status: "Closed",
//   },
//   {
//     id: 3,
//     name: "Rahul Kumar",
//     email: "rahul@gmail.com",
//     mobile: "9988776655",
//     company: "ABC Corp",
//     status: "RNR",
//   },
// ]

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null)

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
  ]

  return (
    <div className="space-y-8">
      {/* PAGE TITLE */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CRM</h1>
      </div>

      {/* ================= STATS ================= */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="rounded-xl border bg-background p-5"
            >
              <p className="text-sm text-muted-foreground">
                {item.title}
              </p>

              <div className="flex items-center justify-between mt-4">
                <h3 className="text-2xl font-bold">
                  {item.value}
                </h3>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          )
        })}
      </div> */}

      {/* ================= COMPANIES ================= */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Companies</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((company, index) => (
            <div
              key={company.companyID}
              onClick={() => setSelectedCompany(company)}
              className={`
                cursor-pointer rounded-xl p-5 text-white shadow
                ${colors[index % colors.length]}
                ${
                  selectedCompany?.companyID === company.companyID
                    ? "ring-4 ring-black/30"
                    : ""
                }
              `}
            >
              <h3 className="text-lg font-semibold">
                {company.companyName}
              </h3>
            </div>
          ))}
        </div>

        {!selectedCompany && (
          <p className="text-sm text-muted-foreground text-center">
            Select a company to view Segments, Sources & Status
          </p>
        )}
      </div>

      {/* ================= COMPANY DETAILS ================= */}
      {selectedCompany && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold mb-3">Segments</h3>
            {companyDetails[selectedCompany.companyID]?.segments.map(
              (item: string, i: number) => (
                <p key={i} className="text-sm py-1">
                  • {item}
                </p>
              )
            )}
          </div>

          <div className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold mb-3">Sources</h3>
            {companyDetails[selectedCompany.companyID]?.sources.map(
              (item: string, i: number) => (
                <p key={i} className="text-sm py-1">
                  • {item}
                </p>
              )
            )}
          </div>

          <div className="rounded-xl border bg-background p-5">
            <h3 className="font-semibold mb-3">Status</h3>
            {companyDetails[selectedCompany.companyID]?.status.map(
              (item: string, i: number) => (
                <p key={i} className="text-sm py-1">
                  • {item}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* ================= LEADS ================= */}
      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Leads</h2>

        <div className="rounded-xl border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Mobile</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="p-3 font-medium">
                    {lead.name}
                  </td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">{lead.mobile}</td>
                  <td className="p-3">{lead.company}</td>
                  <td className="p-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  )
}
