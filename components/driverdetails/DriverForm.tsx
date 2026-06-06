"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Driver } from "./DriverPage"
import { useAuth } from "@/hooks/useAuth"
import { Textarea } from "../ui/textarea"
import { Eye, EyeOff } from "lucide-react"

export default function DriverForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Driver | null
  onSave: (driver: Driver) => void
  onClose: () => void
}) {
  const { session } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState<Driver>({
    driverID: initialData?.driverID ?? 0,
    companyID:
      initialData?.companyID ??
      session?.companyID ??
      "",
    driverName: initialData?.driverName ?? "",
    driverMobileNumber:
      initialData?.driverMobileNumber ?? "",
    driverAddress:
      initialData?.driverAddress ?? "",
    licenseNumber:
      initialData?.licenseNumber ?? "",
    createdBy:
      initialData?.createdBy ??
      session?.userID ??
      "",
    driverStatus:
      initialData?.driverStatus ?? true,
    tripCount: initialData?.tripCount ?? 0,
    totalFreightAmount:
      initialData?.totalFreightAmount ?? 0,
    password: "",
  })

  const [errors, setErrors] = useState<
    Record<string, string>
  >({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.driverName.trim()) {
      newErrors.driverName =
        "Driver name is required"
    }

    if (!form.driverMobileNumber.trim()) {
      newErrors.driverMobileNumber =
        "Mobile number is required"
    } else if (
      !/^\d{10}$/.test(form.driverMobileNumber)
    ) {
      newErrors.driverMobileNumber =
        "Mobile number must be 10 digits"
    }

    if (!form.licenseNumber.trim()) {
      newErrors.licenseNumber =
        "License number is required"
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

    if (name === "driverMobileNumber") {
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
            ? "Edit Driver"
            : "Add Driver"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <Label>Driver Name</Label>

            <Input
              name="driverName"
              value={form.driverName}
              onChange={handleChange}
              placeholder="Enter driver name"
            />

            {errors.driverName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.driverName}
              </p>
            )}
          </div>

          <div>
            <Label>Mobile Number</Label>

            <Input
              name="driverMobileNumber"
              value={form.driverMobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
              maxLength={10}
            />

            {errors.driverMobileNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.driverMobileNumber}
              </p>
            )}
          </div>

          <div>
            <Label>License Number</Label>

            <Input
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="Enter license number"
            />

            {errors.licenseNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.licenseNumber}
              </p>
            )}
          </div>

          <div>
            <Label>Address</Label>

            <Textarea
              name="driverAddress"
              value={form.driverAddress}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </div>
          <div>
            <Label>Password</Label>

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
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