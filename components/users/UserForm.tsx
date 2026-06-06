"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Company } from "@/components/company/CompanyPage"
import { User } from "./UsersPage"
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react"

export default function UserForm({
  companies,
  initialData,
  onSave,
  onClose,
}: {
  companies: Company[]
  initialData: User | null
  onSave: (user: User) => void
  onClose: () => void
}) {
  const { session, role, loading } = useAuth()
  const [form, setForm] = useState<User>({
    userID: initialData?.userID ?? 0,
    companyID: initialData?.companyID  ?? "",
    name: initialData?.name ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    userStatus:
    initialData?.userStatus === true,  
    password: initialData?.password ?? "",  
  })

  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})


  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.name.trim()) {
      newErrors.name = "User name is required"
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required"
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(form.password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/\d/.test(form.password)) {
      newErrors.password = "Password must contain at least one number"
    } else if (!/[@$!%*?&#]/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one special character (@$!%*?&#)"
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email address"
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits"
    }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

useEffect(() => {
  if (role !== "SUPER_ADMIN" && session?.companyID) {
    setForm((prev) => ({
      ...prev,
      companyID: session.companyID,
    }))
  }
}, [role, session?.companyID])

  useEffect(() => {
  if (
    !initialData &&
    companies.length > 0 &&
    form.companyID === ""
  ) {
    setForm((prev) => ({
      ...prev,
      companyID: String(companies[0].companyID), 
    }))
  }
}, [companies, initialData, form.companyID])


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === "phone") {
      // allow only digits
      if (!/^\d*$/.test(value)) return
    }

    setForm({ ...form, [name]: value })

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit User" : "Add User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "SUPER_ADMIN" ? (
              <div>
                <Label>Company</Label>
                <select
                  name="companyID"
                  value={form.companyID}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.companyID} value={c.companyID}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                {/* <Label>Company</Label> */}
                <input
                  type="hidden"
                  value={session?.companyName ?? ""}
                  disabled
                  className="w-full rounded-md border bg-muted px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>
            )}
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Enter User Name" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address" 
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          

          <div>
            <Label>Mobile</Label>
            <Input name="phone" value={form.phone} onChange={handleChange}
            maxLength={10}
              inputMode="numeric"
              placeholder="10-digit phone number"  />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Your Password"
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

         <div>
          <Label>Role</Label>

          <select
            name="role"
            value={form.role ?? ""}
            onChange={handleChange}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Role</option>

            {role === "SUPER_ADMIN" && (
              <>
                {/* <option value="SUPER_ADMIN">Super Admin</option> */}
                <option value="ADMIN">Admin</option>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
                
              </>
            )}
          </select>
        </div>


          

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
