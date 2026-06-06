"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import CompanyForm from "./CompanyForm"
import CompanyList from "./CompanyList"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Input } from "../ui/input"

export type Company = {
  companyID: number
  companyName: string
  address: string
  email: string
  phone: string
  companyStatus: boolean
}



export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Company | null>(null)

  
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [sortBy, setSortBy] = useState<"name" | "latest">("latest")

  const filteredCompanies = companies
  .filter((company) => {
    // 🔍 search filter
    const searchText = search.toLowerCase()
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchText) ||
      company.email.toLowerCase().includes(searchText) ||
      company.phone.includes(searchText)

    // 🟢 status filter
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? company.companyStatus === true
        : company.companyStatus === false

    return matchesSearch && matchesStatus
  })
  .sort((a, b) => {
    // 🔃 sort
    if (sortBy === "name") {
      return a.companyName.localeCompare(b.companyName)
    }
    // latest
    return b.companyID - a.companyID
  })



  const checkDuplicate = async (
    field: "email" | "phone",
    value: string,
    excludeId?: number
  ) => {
    let query = supabase
      .from("companyTable")
      .select("companyID")
      .eq(field, value)

    if (excludeId) {
      query = query.neq("companyID", excludeId)
    }

    const { data } = await query.limit(1)
    return data && data.length > 0
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("companyTable")
        .select("*")
        .order("companyID", { ascending: false })

      if (!error && data) {
        setCompanies(data)
      }
    }
    fetchCompanies()
  }, [])

  const handleSave = async (company: Company) => {

    // 🔍 check email duplicate
    const emailExists = await checkDuplicate(
      "email",
      company.email,
      editing?.companyID
    )

    if (emailExists) {
      toast.error("Email already exists")
      return
    }

    // 🔍 check phone duplicate
    const phoneExists = await checkDuplicate(
      "phone",
      company.phone,
      editing?.companyID
    )

  if (phoneExists) {
    toast.error("Phone number already exists")
    return
  }
  const toastId = toast.loading("Saving company...")

  if (editing) {
    // UPDATE
    const { error } = await supabase
      .from("companyTable")
      .update({
        companyName: company.companyName,
        address: company.address,
        email: company.email,
        phone: company.phone,
      })
      .eq("companyID", company.companyID)

    if (!error) {
      setCompanies((prev) =>
        prev.map((c) => (c.companyID === company.companyID ? company : c))
      )
      toast.success("Company updated", { id: toastId })
    } else {
      toast.error("Update failed", { id: toastId })
    }
  } else {
    // INSERT
    const { data, error } = await supabase
      .from("companyTable")
      .insert({
        companyName: company.companyName,
        address: company.address,
        email: company.email,
        phone: company.phone,
        companyStatus: "TRUE"
      })
      .select()
      .single()

    if (!error && data) {
      setCompanies((prev) => [data, ...prev])
      toast.success("Company added", { id: toastId })
    } else {
      toast.error("Insert failed", { id: toastId })
    }
  }

  setOpen(false)
  setEditing(null)
}


  const handleEdit = (company: Company) => {
    setEditing(company)
    setOpen(true)
  }

  const handleDelete = (companyID: number) => {
    toast("Are you sure?", {
      description: "This company will be removed",
      action: {
        label: "Delete",
        onClick: async () => {
          const { error } = await supabase
            .from("companyTable")
            .update({ companyStatus: false })
            .eq("companyID", companyID)

          if (!error) {
            setCompanies((prev) => prev.filter((c) => c.companyID !== companyID))
            toast.success("Company deleted")
          } else {
            toast.error("Delete failed")
          }
        },
      },
    })
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Button onClick={() => setOpen(true)}>Add Company</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* 🔍 Search */}
        <Input
          placeholder="Search company, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* 🟢 Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* 🔃 Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="name">Ascending </option>
        </select>
      </div>

      {/* List */}
      <CompanyList
        companies={filteredCompanies}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      {open && (
        <CompanyForm
          initialData={editing}
          onClose={() => {
            setOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
