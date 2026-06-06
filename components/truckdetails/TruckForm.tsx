"use client"

import { useEffect, useState } from "react"

import { X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

import { Truck } from "./TruckPage"

const truckTypes = [
  {
    name: "Mini Truck / LCV",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/lcv.png",
  },

  {
    name: "Open Body Truck",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/open_truck.png",
  },

  {
    name: "Closed Container",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/closed_truck.png",
  },

  {
    name: "Trailer",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/trailer.png",
  },

  {
    name: "Tanker",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/tanker.png",
  },

  {
    name: "Tipper",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/tipper.png",
  },

  {
    name: "Other",
    image:
      "https://tpbook.s3.ap-south-1.amazonaws.com/app_statics/vehicle_types_static_icons/drawable-xxxhdpi/bus.png",
  },
]

export default function TruckForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Truck | null
  onSave: (truck: Truck) => void
  onClose: () => void
}) {
  const { session } = useAuth()

  const [suppliers, setSuppliers] = useState<any[]>(
    []
  )

  const [drivers, setDrivers] = useState<any[]>([])

  const [form, setForm] = useState<Truck>({
    truckID: initialData?.truckID ?? 0,

    companyID:
      initialData?.companyID ??
      session?.companyID ??
      "",

    truckNumber:
      initialData?.truckNumber ?? "",

    truckType:
      initialData?.truckType ??
      "Mini Truck / LCV",

    ownershipType:
      initialData?.ownershipType ??
      "My Truck",

    supplierID:
  initialData?.supplierID?.toString() || "",
  
    driverID: initialData?.driverID?.toString() || "",

    createdBy:
      initialData?.createdBy ??
      session?.userID ??
      "",

    truckStatus:
      initialData?.truckStatus ?? true,
      truckModel: initialData?.truckModel ?? "",
      truckCapacity: initialData?.truckCapacity ?? "",
      truckBodyLength: initialData?.truckBodyLength ?? "",
  })

  useEffect(() => {
    if (!session?.companyID) return

    fetchSuppliers()
    fetchDrivers()
  }, [session?.companyID])

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from("supplierTable")
      .select("*")
      .eq("companyID", session?.companyID)
      .eq("supplierStatus", true)

    setSuppliers(data || [])
  }

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from("driversTable")
      .select("*")
      .eq("companyID", session?.companyID)
      .eq("driverStatus", true)

    setDrivers(data || [])
  }

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        
        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {initialData
                ? "Edit Truck"
                : "Add Truck"}
            </h2>

            <p className="text-blue-100 mt-1">
              Manage truck information
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[85vh] overflow-y-auto"
        >
          {/* BASIC DETAILS */}

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label className="mb-2 block text-sm font-semibold text-gray-700">
                Truck Registration Number
              </Label>

              <Input
                value={form.truckNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    truckNumber: e.target.value,
                  })
                }
                placeholder="KA01AB1234"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold text-gray-700">
                Ownership
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      ownershipType:
                        "Market Truck",
                      supplierID: "",
                      driverID: "",
                    })
                  }
                  className={`h-12 rounded-xl border font-medium transition-all
                  
                  ${
                    form.ownershipType ===
                    "Market Truck"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-200"
                  }
                `}
                >
                  Market Truck
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      ownershipType:
                        "My Truck",
                      supplierID: "",
                      driverID: "",
                    })
                  }
                  className={`h-12 rounded-xl border font-medium transition-all
                  
                  ${
                    form.ownershipType ===
                    "My Truck"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-200"
                  }
                `}
                >
                  My Truck
                </button>
              </div>
            </div>
          </div>

          {/* TRUCK TYPES */}

          <div>
            <Label className="text-lg font-semibold text-gray-800 mb-5 block">
              Select Truck Type
            </Label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {truckTypes.map((truck) => (
                <button
                  key={truck.name}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      truckType: truck.name,
                    })
                  }
                  className={`relative rounded-2xl border-2 p-5 transition-all duration-200 group overflow-hidden
                  
                  ${
                    form.truckType ===
                    truck.name
                      ? "border-blue-600 bg-blue-50 shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }
                `}
                >
                  {form.truckType ===
                    truck.name && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all
                      
                      ${
                        form.truckType ===
                        truck.name
                          ? "bg-white shadow-sm"
                          : "bg-gray-50"
                      }
                    `}
                    >
                      <img
                        src={truck.image}
                        alt={truck.name}
                        className="w-14 h-14 object-contain"
                      />
                    </div>

                    <h3
                      className={`text-sm font-semibold text-center leading-5
                      
                      ${
                        form.truckType ===
                        truck.name
                          ? "text-blue-700"
                          : "text-gray-700"
                      }
                    `}
                    >
                      {truck.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* EXTRA DETAILS */}

          <div className="grid md:grid-cols-3 gap-5">
                <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Model
                    </Label>

                    <Input
                    value={form.truckModel}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        truckModel: e.target.value,
                        })
                    }
                    placeholder="Ashok Leyland"
                    className="h-12 rounded-xl"
                    />
                </div>

                <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Capacity
                    </Label>

                    <Input
                    value={form.truckCapacity}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        truckCapacity: e.target.value,
                        })
                    }
                    placeholder="10"
                    className="h-12 rounded-xl"
                    />
                </div>

                <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    Body Length
                    </Label>

                    <Input
                    value={form.truckBodyLength}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        truckBodyLength: e.target.value,
                        })
                    }
                    placeholder="20 ft"
                    className="h-12 rounded-xl"
                    />
                </div>
                </div>

          {/* CONDITIONAL */}

          {form.ownershipType ===
            "Market Truck" && (
            <div>
              <Label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Supplier
              </Label>

              <select
                value={form.supplierID}
                onChange={(e) =>
                    setForm({
                    ...form,
                    supplierID: e.target.value,
                    })
                }
                className="w-full h-12 border rounded-xl px-4 bg-white"
                >
                <option value="">
                    Choose Supplier
                </option>

                {suppliers.map((supplier) => (
                    <option
                    key={supplier.supplierID}
                    value={supplier.supplierID}
                    >
                    {supplier.supplierName}
                    </option>
                ))}
                </select>
            </div>
          )}

          {form.ownershipType ===
            "My Truck" && (
            <div>
              <Label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Driver
              </Label>

              <select
                value={form.driverID}
                onChange={(e) =>
                    setForm({
                    ...form,
                    driverID: e.target.value,
                    })
                }
                className="w-full h-12 border rounded-xl px-4 bg-white"
                >
                <option value="">
                    Choose Driver
                </option>

                {drivers.map((driver) => (
                    <option
                    key={driver.driverID}
                    value={driver.driverID}
                    >
                    {driver.driverName}
                    </option>
                ))}
                </select>
            </div>
          )}

          {/* FOOTER */}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-8 h-12"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="rounded-xl px-8 h-12 bg-blue-600 hover:bg-blue-700"
            >
              {initialData
                ? "Update Truck"
                : "Save Truck"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}