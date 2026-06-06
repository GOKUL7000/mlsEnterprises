"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Party } from "./PartiesPage"
import { useAuth } from "@/hooks/useAuth"
import { Textarea } from "../ui/textarea"

export default function PartiesForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Party | null
  onSave: (party: Party) => void
  onClose: () => void
}) {
  const { session } = useAuth()

  const [form, setForm] = useState<Party>({
  partiesID: initialData?.partiesID ?? 0,
  companyID: initialData?.companyID ?? session?.companyID ?? "",
  partyName: initialData?.partyName ?? "",
  partyMobileNumber: initialData?.partyMobileNumber ?? "",
  partyAddress: initialData?.partyAddress ?? "",
  partyStatus: initialData?.partyStatus ?? true,
  createdBy: initialData?.createdBy ?? "",
  partyGST: initialData?.partyGST ?? "",
  partyPan: initialData?.partyPan ?? "",

  tripCount: initialData?.tripCount ?? 0,
  totalFreightAmount: initialData?.totalFreightAmount ?? 0,
  pendingAmount: initialData?.pendingAmount ?? 0,
  settledAmount: initialData?.settledAmount ?? 0,
})

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.partyName.trim()) {
      newErrors.partyName = "Party name is required"
    }

    if (!form.partyMobileNumber.trim()) {
      newErrors.partyMobileNumber = "Mobile number is required"
    } else if (!/^\d{10}$/.test(form.partyMobileNumber)) {
      newErrors.partyMobileNumber =
        "Mobile number must be 10 digits"
    }

    if (!form.partyAddress.trim()) {
      newErrors.partyAddress = "Address is required"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
  ) => {
    const { name, value } = e.target

    if (name === "partyMobileNumber") {
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
          {initialData ? "Edit Party" : "Add Party"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Party Name</Label>
            <Input
              name="partyName"
              value={form.partyName}
              onChange={handleChange}
              placeholder="Enter party name"
            />
            {errors.partyName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.partyName}
              </p>
            )}
          </div>

          <div>
            <Label>Mobile Number</Label>
            <Input
              name="partyMobileNumber"
              value={form.partyMobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
              maxLength={10}
            />
            {errors.partyMobileNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.partyMobileNumber}
              </p>
            )}
          </div>

          <div>
            <Label>Address</Label>
            <Textarea
              name="partyAddress"
              value={form.partyAddress}
              rows={3}

              onChange={handleChange}
              placeholder="Enter address"
            />
            {errors.partyAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.partyAddress}
              </p>
            )}
          </div>
          <div>
            <Label>GST Number</Label>
            <Input  
                name="partyGST"
                value={form.partyGST}
                onChange={handleChange}
                placeholder="Enter GST number"
            />
          </div>
          <div>
            <Label>PAN Number</Label>
            <Input  
                name="partyPan"
                value={form.partyPan}
                onChange={handleChange}
                placeholder="Enter PAN number"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
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
