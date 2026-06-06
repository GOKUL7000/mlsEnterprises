"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Company } from "./CompanyPage"
import { Textarea } from "@/components/ui/textarea"

export default function CompanyForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Company | null
  onSave: (company: Company) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Company>({
    companyID: initialData?.companyID ?? 0, 
    companyName: initialData?.companyName ?? "",
    address: initialData?.address ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    companyStatus:
    initialData?.companyStatus === true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          {initialData ? "Edit Company" : "Add Company"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name"  />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"  
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
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
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange} 
              maxLength={10}
              inputMode="numeric"
              placeholder="10-digit phone number"             
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
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
