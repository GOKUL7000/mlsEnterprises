"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"

import { Trip } from "./TripPage"
import { ChevronsUpDown, Truck } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const billingTypes = [
  "Fixed",
  "Per Tonne",
  "Per Kg",
  "Per Km",
  "Per Trip",
  "Per Day",
  "Per Hour",
  "Per Litre",
  "Per Bag",
]

export default function TripForm({
  initialData,
  onSave,
  onClose,
}: {
  initialData: Trip | null
  onSave: (trip: Trip) => void
  onClose: () => void
}) {
  const { session } = useAuth()

  const [parties, setParties] =
    useState<any[]>([])

  const [trucks, setTrucks] =
    useState<any[]>([])

    const [suppliers, setSuppliers] = useState<any[]>([])
const [drivers, setDrivers] = useState<any[]>([])
const [openTruckPopover, setOpenTruckPopover] =  useState(false)

  const [form, setForm] = useState<Trip>({
    tripID: initialData?.tripID ?? 0,

    companyID:
      initialData?.companyID ||
      session?.companyID ||
      null,

    partiesID:
      initialData?.partiesID || "",

    truckID:
      initialData?.truckID || "",

    origin:
      initialData?.origin || "",

    destination:
      initialData?.destination || "",

    billingType:
      initialData?.billingType ||
      "Fixed",

   quantity: initialData?.quantity || "",
    rate: initialData?.rate || "",  

    freightAmount:
      initialData?.freightAmount ||
      "",

    startDate:
      initialData?.startDate || "",

    start_km:
      initialData?.start_km ||
      0,

    lrNumber:
      initialData?.lrNumber || "",

    materialName:
      initialData?.materialName ||
      "",

    notes:
      initialData?.notes || "",

    tripStatus:
      initialData?.tripStatus ?? true,

    createdBy:
      initialData?.createdBy ||
      session?.userID ||
      null,

      
  })

  useEffect(() => {
    if (!session?.companyID) return

    fetchParties()
    fetchTrucks()
    fetchSuppliers()
    fetchDrivers()
  }, [session?.companyID])

  const fetchParties = async () => {
    const { data } = await supabase
      .from("partiesTable")
      .select("*")
      .eq(
        "companyID",
        session?.companyID
      )
      .eq("partyStatus", true)

    setParties(data || [])
  }

  const fetchTrucks = async () => {
    const { data } = await supabase
      .from("trucksTable")
      .select("*")
      .eq(
        "companyID",
        session?.companyID
      )
      .eq("truckStatus", true)

    setTrucks(data || [])
  }

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    onSave(form)
  }

  const selectedTruck = trucks.find(
  (t) =>
    t.truckID.toString() === form.truckID
)

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

const calculateFreight = (
  rate: string = "",
  quantity: string = ""
) => {
  const total =
    (Number(rate) || 0) *
    (Number(quantity) || 0)

  setForm((prev) => ({
    ...prev,
    rate,
    quantity,
    freightAmount:
      total > 0
        ? total.toString()
        : "",
  }))
}

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {initialData
              ? "Edit Trip"
              : "Add Trip"}
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-gray-400"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-8 max-h-[90vh] overflow-y-auto"
        >
          <div>
            <h3 className="text-2xl font-semibold mb-5">
              Trip Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>
                  Select Party *
                </Label>

                <select
                  value={form.partiesID}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      partiesID:
                        e.target.value,
                    })
                  }
                  className="w-full h-12 border rounded-lg px-4 mt-2"
                >
                  <option value="" disabled>
                    Eg: Select Party
                  </option>

                  {parties.map((party) => (
                    <option
                      key={
                        party.partiesID
                      }
                      value={
                        party.partiesID
                      }
                    >
                      {party.partyName}
                    </option>
                  ))}
                </select>
              </div>

              
                  <div>
                    <Label>Truck Registration No.*</Label>

                    <Popover
                        open={openTruckPopover}
                        onOpenChange={setOpenTruckPopover}
                      >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between mt-2"
                        >
                          {selectedTruck
                            ? selectedTruck.truckNumber
                            : "Select Truck"}

                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-[450px] p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                          {trucks.map((truck) => (
                            <div
                              key={truck.truckID}
                              onClick={() => {
                                setForm({
                                  ...form,
                                  truckID:
                                    truck.truckID.toString(),

                                  supplierID: "",
                                  driverID: "",
                                })

                                setOpenTruckPopover(false)
                              }}
                              className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {truck.truckNumber}
                                </span>

                                {truck.ownershipType ===
                                "Market Truck" ? (
                                  <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded">
                                    Market
                                  </span>
                                ) : (
                                  <span className="bg-blue-700 text-white text-[10px] px-2 py-1 rounded">
                                    Own
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  AVAILABLE
                                </span>

                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* MARKET TRUCK */}

                  {selectedTruck?.ownershipType ===
                    "Market Truck" && (
                    <div>
                      <Label>Supplier *</Label>

                      <select
                        value={form.supplierID || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            supplierID:
                              e.target.value,
                          })
                        }
                        className="w-full h-12 border rounded-lg px-4 mt-2"
                      >
                        <option value="">
                          Select Supplier
                        </option>

                        {suppliers.map(
                          (supplier) => (
                            <option
                              key={
                                supplier.supplierID
                              }
                              value={
                                supplier.supplierID
                              }
                            >
                              {
                                supplier.supplierName
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {/* OWN TRUCK */}

                  {selectedTruck?.ownershipType ===
                    "My Truck" && (
                    <div>
                      <Label>Driver *</Label>

                      <select
                        value={form.driverID || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            driverID:
                              e.target.value,
                          })
                        }
                        className="w-full h-12 border rounded-lg px-4 mt-2"
                      >
                        <option value="">
                          Select Driver
                        </option>

                        {drivers.map((driver) => (
                          <option
                            key={driver.driverID}
                            value={
                              driver.driverID
                            }
                          >
                            {driver.driverName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-5">
              Route
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Origin*</Label>

                <Input
                  value={form.origin}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      origin:
                        e.target.value,
                    })
                  }
                  placeholder="Eg. Bangalore"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label>
                  Destination*
                </Label>

                <Input
                  value={form.destination}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      destination:
                        e.target.value,
                    })
                  }
                  placeholder="Eg. Delhi"
                  className="mt-2 h-12"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-5">
              Billing Information
            </h3>

            <div className="space-y-6">
              <div>
                <Label>
                  Party Billing Type *
                </Label>
                

                <div className="flex flex-wrap gap-2 mt-3">
                  {billingTypes.map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() =>
                          setForm({
                            ...form,
                            billingType:
                              type,

                              rate: "",
                              quantity: "",
                              freightAmount: "",
                          })
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all

                        ${
                          form.billingType ===
                          type
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    Party Freight Amount*
                  </Label>

                  <Input
                    value={
                      form.freightAmount
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        freightAmount:
                          e.target.value,
                      })
                    }
                    placeholder="₹ Eg: 45,000"
                    className="mt-2 h-12"
                  />
                </div>
              </div> */}

              {form.billingType !== "Fixed" && (
  <div className="grid md:grid-cols-2 gap-6">
    <div>
      <Label>
        Rate Per{" "}
        {form.billingType.replace(
          "Per ",
          ""
        )}
      </Label>

      <Input
        value={form.rate}
        onChange={(e) =>
          calculateFreight(
            e.target.value,
            form.quantity
          )
        }
        placeholder={`Rate Per ${form.billingType.replace(
          "Per ",
          ""
        )}`}
        className="mt-2 h-12"
      />
    </div>

    <div>
      <Label>
        Total{" "}
        {form.billingType.replace(
          "Per ",
          ""
        )}
      </Label>

      <Input
        value={form.quantity}
        onChange={(e) =>
          calculateFreight(
            form.rate,
            e.target.value
          )
        }
        placeholder={`Total ${form.billingType.replace(
          "Per ",
          ""
        )}`}
        className="mt-2 h-12"
      />
    </div>
  </div>
)}

              <div>
  <Label>
    Party Freight Amount*
  </Label>

  <Input
    value={form.freightAmount}
    onChange={(e) =>
      form.billingType ===
        "Fixed" &&
      setForm({
        ...form,
        freightAmount:
          e.target.value,
      })
    }
    readOnly={
      form.billingType !==
      "Fixed"
    }
    placeholder="₹ Eg: 45,000"
    className="mt-2 h-12"
  />
</div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>
                    Start Date*
                  </Label>

                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startDate:
                          e.target.value,
                      })
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label>
                    Start Kms Reading
                  </Label>

                  <Input
                    type="number"
                    value={
                      form.start_km
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_km:
                          Number(e.target.value),
                      })
                    }
                    placeholder="Start readings"
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-5">
              More Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>LR No</Label>

                <Input
                  value={form.lrNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lrNumber:
                        e.target.value,
                    })
                  }
                  placeholder="LRN 798"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label>Material</Label>

                <Input
                  value={
                    form.materialName
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materialName:
                        e.target.value,
                    })
                  }
                  placeholder="Enter Material Name"
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label>Notes</Label>

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value,
                  })
                }
                placeholder="Notes"
                className="w-full border rounded-lg p-4 mt-2 min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>

            <Button type="submit">
              Save Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
