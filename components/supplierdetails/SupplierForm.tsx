"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Supplier } from "./SupplierPage"
import { useAuth } from "@/hooks/useAuth"
import { Textarea } from "../ui/textarea"

export default function SupplierForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Supplier | null
  onSave: (supplier: Supplier) => void
  onClose: () => void
}) {
  const { session } = useAuth()

  const [form, setForm] = useState<Supplier>({
    supplierID: initialData?.supplierID ?? 0,
    companyID:
      initialData?.companyID ??
      session?.companyID ??
      "",
    supplierName: initialData?.supplierName ?? "",
    supplierMobileNumber:
      initialData?.supplierMobileNumber ?? "",
    supplierAddress:
      initialData?.supplierAddress ?? "",
    createdBy:
      initialData?.createdBy ??
      session?.userID ??
      "",
    supplierStatus:
      initialData?.supplierStatus ?? true,
    tripCount: initialData?.tripCount ?? 0,
    totalFreightAmount:
      initialData?.totalFreightAmount ?? 0,
  })

  const [errors, setErrors] = useState<
    Record<string, string>
  >({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.supplierName.trim()) {
      newErrors.supplierName =
        "Supplier name is required"
    }

     if (!form.supplierMobileNumber.trim()) {
      newErrors.supplierMobileNumber = "Mobile number is required"
    } else if (!/^\d{10}$/.test(form.supplierMobileNumber)) {
      newErrors.supplierMobileNumber =
        "Mobile number must be 10 digits"
    }

    if (!form.supplierAddress.trim()) {
      newErrors.supplierAddress =
        "Address is required"
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

    if (name === "supplierMobileNumber") {
        if (!/^\d*$/.test(value)) return
    }

    setForm({
        ...form,
        [name]: value,
    })

    if (errors[name]) {
        setErrors({
        ...errors,
        [name]: "",
        })
    }
    }

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!validate()) return

    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {initialData
            ? "Edit Supplier"
            : "Add Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <Label>Supplier Name</Label>

            <Input
              name="supplierName"
              value={form.supplierName}
              onChange={handleChange}
              placeholder="Enter supplier name"
            />

            {errors.supplierName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supplierName}
              </p>
            )}
          </div>

          <div>
            <Label>Mobile Number</Label>

            <Input
              name="supplierMobileNumber"
              value={form.supplierMobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
              maxLength={10}
            />

            {errors.supplierMobileNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supplierMobileNumber}
              </p>
            )}
          </div>

          <div>
            <Label>Address</Label>

            <Textarea
              name="supplierAddress"
              value={form.supplierAddress}
              onChange={handleChange}
              placeholder="Enter address"
            />

            {errors.supplierAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.supplierAddress}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
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