"use client"

import { useState,useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import UserForm from "./UserForm"
import UsersList from "./UsersList"
import { Company } from "@/components/company/CompanyPage"
import { supabase } from "@/lib/supabase"
import { Input } from "../ui/input"
import bcrypt from "bcryptjs"
import { useAuth } from "@/hooks/useAuth";


export type User = {
  userID: number
  companyID: string
  name: string
  email: string
  phone: string
  userStatus: boolean

  // joined fields
  companyName?: string
  username?: string
  password: string
  role?: string
  
}


export default  function UsersPage() {
  const { session, role, loading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [sortBy, setSortBy] = useState<"name" | "latest">("latest")
  const [companyFilter, setCompanyFilter] = useState<"all" | string>("all");

  const [showLimitModal, setShowLimitModal] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")

  

 const filteredUsers = users
  .filter((u) => {
    const text = search.toLowerCase();

    const matchesSearch =
      u.name.toLowerCase().includes(text) ||
      // u.email.toLowerCase().includes(text) ||
      u.phone.includes(text) ||
      u.role?.toLowerCase().includes(text) ||
      u.companyName?.toLowerCase().includes(text);

   const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? Boolean(u.userStatus)
        : !Boolean(u.userStatus);

    const matchesCompany =
      companyFilter === "all"
        ? true
        : u.companyID === (companyFilter);

       

    return matchesSearch && matchesStatus && matchesCompany;
  })
  .sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return b.userID - a.userID;
  });

 
  const checkDuplicate = async (
    field: "name" | "phone",
    value: string,
    excludeId?: number
  ) => {
    let query = supabase
      .from("userTable")
      .select("userID")
      .eq("userStatus", true)
      .eq(field, value)

    if (excludeId) {
      query = query.neq("userID", excludeId)
    }

    const { data } = await query.limit(1)
    return data && data.length > 0
  }

 
useEffect(() => {
  if (companies.length === 1) {
    setCompanyFilter(String(companies[0].companyID));
  }
}, [companies]);



 useEffect(() => {
  if (loading) return
    if (!role) return

    fetchUsers()
  }, [role, session?.companyID, loading])

  const fetchUsers = async () => {
    let query = supabase
      .from("userTable")
      .select(`
        userID,
        companyID,
        name,
        email,
        phone,
        userStatus,
        companyTable (
          companyName
        ),
        loginTable!inner (
          username,
          role
        )
      `)
      .eq("userStatus", true)
      .order("userID", { ascending: false })

    // 🔐 Role Based Filtering
    if (role === "SUPER_ADMIN") {
      query = query.neq("loginTable.role", "SUPER_ADMIN")
    }

    if (role === "ADMIN") {
      query = query.neq("loginTable.role", ["SUPER_ADMIN"])
      query = query.eq("companyID", session?.companyID)
    }


      

    // if (role !== "ADMIN") 
    //   { query = query.eq("companyID", session?.companyID) }

    
    

    const { data, error } = await query

    

    if (error) {
      console.error(error)
      return
    }
   

    setUsers(
      data.map((u: any) => ({
        ...u,
        companyName: u.companyTable?.companyName ?? "—",
        username: u.loginTable[0]?.username ?? "",
        role: u.loginTable[0]?.role ?? "",
      }))
    )
  }

  useEffect(() => {
  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companyTable")
      .select("companyID, companyName, address, email, phone, companyStatus")
      .eq("companyStatus", true)

    if (data) setCompanies(data)
  }

  fetchCompanies()
}, [])








  const handleSave = async (user: User) => {
    
    // 🔍 check email duplicate
        // const emailExists = await checkDuplicate(
        //   "name",
        //   user.name,
        //   editing?.userID
        // )
    
        // if (emailExists) {
        //   toast.error("Name already exists")
        //   return
        // }
    
        // 🔍 check phone duplicate
      //   const phoneExists = await checkDuplicate(
      //     "phone",
      //     user.phone,
      //     editing?.userID
      //   )
    
      // if (phoneExists) {
      //   toast.error("Phone number already exists")
      //   return
      // }


    if (editing) {
      //Update
      const toastId = toast.loading("Updating user...")

  try {
    // 1️⃣ Update userTable
    const { error: userError } = await supabase
      .from("userTable")
      .update({
        companyID: user.companyID,
        name: user.name,
        email: user.email,
        phone: user.phone,
      })
      .eq("userID", user.userID)

    if (userError) throw userError

    // 2️⃣ Update loginTable
    const loginPayload: any = {
      role: user.role,
      username: user.name?.toLowerCase(),
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    // update password only if changed
    if (user.password) {
      loginPayload.password = hashedPassword
    }

    const { error: loginError } = await supabase
      .from("loginTable")
      .update(loginPayload)
      .eq("userID", user.userID)

    if (loginError) throw loginError

    setUsers((prev) =>
      prev.map((u) =>
        u.userID === user.userID
          ? {
              ...u,
              name: user.name,
              email: user.email,
              phone: user.phone,
              companyID: user.companyID,
              role: user.role ?? u.role,
              userStatus: user.userStatus,             
             
              username: user.email,
             
              companyName:
                companies.find((c) => c.companyID === Number(user.companyID))
                  ?.companyName ?? u.companyName,
            }
          : u
      )
    )

    toast.success("User updated successfully", { id: toastId })
    
  } catch (err: any) {
    toast.error(err.message ?? "User update failed", { id: toastId })
    return false
  }
      
    } else {
      //INSERT

      

      
      const toastId = toast.loading("Creating user...")

     
        try {
          // 1 Insert into userTable
          const { data: userData, error: userError } = await supabase
            .from("userTable")
            .insert({
              companyID: user.companyID,
              name: user.name,
              email: user.email,
              phone: user.phone,
              userStatus: true,
            })
            .select()
            .single()

          if (userError) throw userError
            // 2. Hash password
          const hashedPassword = await bcrypt.hash(user.password, 10)
          // 3 Insert into loginTable
          const { data, error: loginError } = await supabase
            .from("loginTable")
            .insert({
              userID: userData.userID,
              username: user.name?.toLowerCase(),
              password: hashedPassword, 
              role: user.role,
              status: "TRUE"
            })

          if (loginError) throw loginError

          // 4. Build FULL user object for UI
            const companyName =
              companies.find((c) => c.companyID === userData.companyID)
                ?.companyName ?? ""

            const fullUser: User = {
              userID: userData.userID,
              companyID: userData.companyID,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              userStatus: userData.userStatus,
              companyName,
              username: user.email,
              password: user.password,
              role: user.role,
            }

            // 5. Push into state
            setUsers((prev) => [fullUser, ...prev])
          

          toast.success("User created successfully", { id: toastId })
          
          
        } catch (err: any) {
          toast.error(err.message ?? "User creation failed", { id: toastId })
          return null
        }
    }

    setOpen(false)
    setEditing(null)
  }

  const handleEdit = (user: User) => {
    setEditing(user)
    setOpen(true)
  }

  /* =========================
     SOFT DELETE (like Company)
  ========================== */
  const handleDelete = (userID: number) => {
    toast("Are you sure?", {
      description: "This user will be deactivated",
      action: {
        label: "Delete",
        onClick: async () => {
          await supabase
            .from("userTable")
            .update({ userStatus: false })
            .eq("userID", userID)
            
          
          setUsers((prev) =>
            prev.map((u) =>
              u.userID === userID ? { ...u, userStatus: false } : u
            )
          )

          toast.success("User deactivated")

          await fetchUsers();
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setOpen(true)}>Add User</Button>
      </div>

       <div className="flex flex-wrap gap-3 items-center">
        {/* 🔍 Search */}
        <Input
          placeholder="Search User, email, phone..."
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

        {/* 🟢 Company Filter */}
        {(role === "SUPER_ADMIN" || role === "manager") && (
          <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Companies</option>

              {companies.map((c) => (
                <option key={c.companyID} value={c.companyID}>
                  {c.companyName}
                </option>
              ))}
            </select>
          )}


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
      <UsersList
        users={filteredUsers}
        companies={companies}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form */}
      {open && (
        <UserForm
          companies={companies}
          initialData={editing}
          onClose={() => {
            setOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )} 

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-105 space-y-4">
            <h2 className="text-lg font-semibold text-red-600">
              User Limit Reached
            </h2>

            <p className="text-sm text-gray-700">
              {limitMessage}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLimitModal(false)
                  setOpen(false)
                  setEditing(null)
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  )
}
