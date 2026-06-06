"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Flag, IndianRupee, Loader2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"



export default function TripViewPage() {
  const { id } = useParams()

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [openStartDialog, setOpenStartDialog] = useState(false);

   const [startKm, setStartKm] = useState("");
   const [startPhoto, setStartPhoto] = useState<File | null>(null);

   const [openUnloadingDialog, setOpenUnloadingDialog] = useState(false);

   const [generatingBill, setGeneratingBill] =
  useState(false);

   const [expenses, setExpenses] =
  useState<any[]>([]);

    const [unloadingKm, setUnloadingKm] = useState("");

    const [unloadingKmPhoto, setUnloadingKmPhoto] =
    useState<File | null>(null);

    const [unloadingPhoto, setUnloadingPhoto] =
    useState<File | null>(null);

    const [openTripCompletedDialog,
    setOpenTripCompletedDialog] =
    useState(false);

    const [endKm,
    setEndKm] =
    useState("");

    const [endKmPhoto,
    setEndKmPhoto] =
    useState<File | null>(null);

    const [openPodReceivedDialog,
    setOpenPodReceivedDialog] =
    useState(false);

    const [podPhoto,
    setPodPhoto] =
    useState<File | null>(null);

    const [podRemarks,
    setPodRemarks] =
    useState("");

    const [settlementType,
        setSettlementType] =
        useState("");

    const [openSettlementDialog,
     setOpenSettlementDialog] =
     useState(false);

   const [savingStartTrip, setSavingStartTrip] =
    useState(false);
   
    const [savingUnloading, setSavingUnloading] =
  useState(false);

    const [savingTripCompleted,
    setSavingTripCompleted] =
    useState(false);

    const [savingPod,
    setSavingPod] =
    useState(false);

    const [savingSettlement,
    setSavingSettlement] =
    useState(false);

    const [openExpenseDialog,
        setOpenExpenseDialog] =
        useState(false);

        const [expenseType,
        setExpenseType] =
        useState("");

        const [expenseAmount,
        setExpenseAmount] =
        useState("");

        const [expenseDate,
        setExpenseDate] =
        useState(
        new Date()
            .toISOString()
            .split("T")[0]
        );

        const [paymentMode,
        setPaymentMode] =
        useState("Cash");

        const [addToPartyBill,
        setAddToPartyBill] =
        useState(false);

        const [notes,
        setNotes] =
        useState("");

        const [savingExpense,
        setSavingExpense] =
        useState(false);

            useEffect(() => {
                if (id) {
                fetchTripDetails()
                }
            }, [id])

   
  

        const fetchTripDetails = async () => {

            console.log("Fetching details for trip ID:", id)

              if (!trip) {
                    setLoading(true);
                }

            

            const { data: tripData, error } = await supabase
            .from("tripsTable")
            .select("*")
            .eq("tripID", id)
            .single()

            if (error) {
            console.error(error)
            setLoading(false)
            return
            }

            const { data: partyData } = await supabase
            .from("partiesTable")
            .select("partiesID, partyName")
            .eq("partiesID", tripData.partiesID)
            .single()

            const { data: truckData } = await supabase
            .from("trucksTable")
            .select("*")
            .eq("truckID", tripData.truckID)
            .single()
            

            

            let driverData = null
            let supplierData = null

            if (tripData.driverID) {
            const { data } = await supabase
                .from("driversTable")
                .select("*")
                .eq("driverID", tripData.driverID)
                .single()

            driverData = data
            }

            if (tripData.supplierID) {
            const { data } = await supabase
                .from("supplierTable")
                .select("*")
                .eq("supplierID", tripData.supplierID)
                .single()

            supplierData = data
            }

            
            setTrip({
            ...tripData,

            partyName: partyData?.partyName || "",

            truckNumber: truckData?.truckNumber || "",
            truckType: truckData?.truckType || "",
            truckModel: truckData?.truckModel || "",
            truckCapacity: truckData?.truckCapacity || "",
            truckBodyLength: truckData?.truckBodyLength || "",
            ownershipType: truckData?.ownershipType || "",

            driverName: driverData?.driverName || "",
            driverMobile:
                driverData?.driverMobileNumber || "",

            supplierName:
                supplierData?.supplierName || "",

            supplierMobile:
                supplierData?.supplierMobileNumber || "",
            })

            const { data: expenseData } =
        await supabase
            .from("trip_expenses")
            .select("*")
            .eq(
            "trip_id",
            id
            )
            .order(
            "created_at",
            {
                ascending: false
            }
            );

        setExpenses(
        expenseData || []
        );

            setLoading(false)
        }

        const steps = [
        {
            title: "Trip Started",
            date: trip?.started_at,
        },
        {
            title: "Unloading Completed",
            date: trip?.unloading_completed_at,
        },
        {
            title: "Trip Completed",
            date: trip?.trip_completed_at,
        },
        {
            title: "POD Received",
            date: trip?.pod_received_at,
        },
        {
            title: "POD Submitted",
            date: trip?.pod_submitted_at,
        },
        {
            title: "Settled",
            date: trip?.settled_at,
        },
        ];

   if (!trip) {
        return (
        <div className="p-6">
            Trip not found
        </div>
        )
    }


        const handleTripStart = async () => {

        if (!startKm) {
            toast.error("Please enter start KM");
            return;
        }

        if (!startPhoto) {
            toast.error("Please upload KM photo");
            return;
        }

        setSavingStartTrip(true);

            try {

                // Upload photo
                const fileName = `${trip.tripID}-${Date.now()}-${startPhoto.name}`;

                const {
                    data: { user },
                    } = await supabase.auth.getUser();

                    console.log("CURRENT USER:", user);

            const { error: uploadError } = await supabase.storage
            .from("trip-photos")
            .upload(`start/${fileName}`, startPhoto);

            if (uploadError) {
            console.log("UPLOAD ERROR:", uploadError);
            toast.error(uploadError.message);
            return;
            }


                // Get Public URL
                const { data: publicUrlData } = supabase.storage
                .from("trip-photos")
                .getPublicUrl(`start/${fileName}`);

                const photoUrl = publicUrlData.publicUrl;

                // Update Trip
                const { error: tripError } = await supabase
                .from("tripsTable")
                .update({
                    current_step: 1,
                    start_km: Number(startKm),
                    start_photo: photoUrl,
                    started_at: new Date().toISOString(),
                })
                .eq("tripID", trip.tripID);

                if (tripError) {
            console.log("TRIP ERROR:", tripError);
            toast.error(tripError.message);
            return;
            }

                // Insert History
                const { error: historyError } = await supabase
                .from("trip_stage_history")
                .insert({
                    trip_id: trip.tripID,
                    stage: "Trip Started",
                    km: Number(startKm),
                    photo_url: photoUrl,
                });

            if (historyError) {
            console.log("HISTORY ERROR:", historyError);
            }

                toast.success("Trip started successfully");

                setOpenStartDialog(false);

                fetchTripDetails();

            } catch (error) {
                console.error(error);
                toast.error("Something went wrong");
            }
            finally {

            setSavingStartTrip(false);

        }
            };

        const handleUnloadingCompleted = async () => {

            if (!unloadingKm) {
                toast.error("Please enter unloading KM");
                return;
            }

            if (!unloadingKmPhoto) {
                toast.error("Please upload KM photo");
                return;
            }

            if (!unloadingPhoto) {
                toast.error("Please upload unloading photo");
                return;
            }
            setSavingUnloading(true)
            try {

                // Upload KM Photo
                const kmPhotoName =
                `${trip.tripID}-km-${Date.now()}-${unloadingKmPhoto.name}`;

                const { error: kmUploadError } =
                await supabase.storage
                    .from("trip-photos")
                    .upload(
                    `unloading/${kmPhotoName}`,
                    unloadingKmPhoto
                    );

                if (kmUploadError) {
                toast.error(kmUploadError.message);
                return;
                }

                const {
                data: kmPublicUrl
                } = supabase.storage
                .from("trip-photos")
                .getPublicUrl(
                    `unloading/${kmPhotoName}`
                );

                // Upload Unloading Photo

                const unloadingPhotoName =
                `${trip.tripID}-unloading-${Date.now()}-${unloadingPhoto.name}`;

                const {
                error: unloadingUploadError
                } = await supabase.storage
                .from("trip-photos")
                .upload(
                    `unloading/${unloadingPhotoName}`,
                    unloadingPhoto
                );

                if (unloadingUploadError) {
                toast.error(unloadingUploadError.message);
                return;
                }

                const {
                data: unloadingPublicUrl
                } = supabase.storage
                .from("trip-photos")
                .getPublicUrl(
                    `unloading/${unloadingPhotoName}`
                );

                // Update Trip

                const { error: tripError } =
                await supabase
                    .from("tripsTable")
                    .update({
                    current_step: 2,

                    unloading_km:
                        Number(unloadingKm),

                    unloading_km_photo:
                        kmPublicUrl.publicUrl,

                    unloading_photo:
                        unloadingPublicUrl.publicUrl,

                    unloading_completed_at:
                        new Date().toISOString()
                    })
                    .eq(
                    "tripID",
                    trip.tripID
                    );

                if (tripError) {
                toast.error(
                    tripError.message
                );
                return;
                }

                // History

                await supabase
                .from("trip_stage_history")
                .insert({
                    trip_id:
                    trip.tripID,

                    stage:
                    "Unloading Completed",

                    km:
                    Number(unloadingKm),

                    photo_url:
                    kmPublicUrl.publicUrl
                });

                toast.success(
                "Unloading completed successfully"
                );

                setOpenUnloadingDialog(false);

                fetchTripDetails();

            } catch (error) {

                console.error(error);

                toast.error(
                "Something went wrong"
                );

            }  finally {

            setSavingUnloading(false);

        }
            };

        const handleTripCompleted = async () => {

        if (!endKm) {
            toast.error("Please enter end KM");
            return;
        }

        if (!endKmPhoto) {
            toast.error("Please upload end KM photo");
            return;
        }
        setSavingTripCompleted(true)
        try {

            // Upload End KM Photo

            const photoName =
            `${trip.tripID}-end-${Date.now()}-${endKmPhoto.name}`;

            const { error: uploadError } =
            await supabase.storage
                .from("trip-photos")
                .upload(
                `end/${photoName}`,
                endKmPhoto
                );

            if (uploadError) {
            toast.error(uploadError.message);
            return;
            }

            const {
            data: publicUrlData
            } = supabase.storage
            .from("trip-photos")
            .getPublicUrl(
                `end/${photoName}`
            );

            const photoUrl =
            publicUrlData.publicUrl;

            // Calculate Total KM

            const totalKm =
            Number(endKm) -
            Number(trip.start_km);

            // Update Trip

            const { error: tripError } =
            await supabase
                .from("tripsTable")
                .update({

                current_step: 3,

               


                end_km:
                    Number(endKm),

                end_photo:
                    photoUrl,

                total_km:
                    totalKm,

                trip_completed_at:
                    new Date().toISOString()

                })
                .eq(
                "tripID",
                trip.tripID
                );

            if (tripError) {
            toast.error(
                tripError.message
            );
            return;
            }

            // History

            await supabase
            .from("trip_stage_history")
            .insert({

                trip_id:
                trip.tripID,

                stage:
                "Trip Completed",

                km:
                Number(endKm),

                photo_url:
                photoUrl

            });

            toast.success(
            "Trip completed successfully"
            );

            setOpenTripCompletedDialog(false);

            fetchTripDetails();

        } catch (error) {

            console.error(error);

            toast.error(
            "Something went wrong"
            );

        } finally{
            setSavingTripCompleted(false)
        }
        };

        const handlePodReceived = async () => {

        if (!podPhoto) {
            toast.error("Please upload POD");
            return;
        }
        setSavingPod(true)
        try {

            const fileName =
            `${trip.tripID}-pod-${Date.now()}-${podPhoto.name}`;

            const { error: uploadError } =
            await supabase.storage
                .from("trip-photos")
                .upload(
                `pod/${fileName}`,
                podPhoto
                );

            if (uploadError) {
            toast.error(uploadError.message);
            return;
            }

            const {
            data: publicUrlData
            } = supabase.storage
            .from("trip-photos")
            .getPublicUrl(
                `pod/${fileName}`
            );

            const photoUrl =
            publicUrlData.publicUrl;

            const { error } =
            await supabase
                .from("tripsTable")
                .update({

                current_step: 4,

                pod_photo:
                    photoUrl,

                pod_received_at:
                    new Date().toISOString()

                })
                .eq(
                "tripID",
                trip.tripID
                );

            if (error) {
            toast.error(error.message);
            return;
            }

            await supabase
            .from("trip_stage_history")
            .insert({

                trip_id:
                trip.tripID,

                stage:
                "POD Received",

                remarks:
                podRemarks,

                photo_url:
                photoUrl

            });

            toast.success(
            "POD received successfully"
            );

            setOpenPodReceivedDialog(false);

            fetchTripDetails();

        } catch (error) {

            console.error(error);

            toast.error(
            "Something went wrong"
            );

        } finally {
            setSavingPod(false)
        }
        };

        const handlePodSubmitted = async () => {

                const { error } =
                    await supabase
                    .from("tripsTable")
                    .update({

                        current_step: 5,

                        pod_submitted_at:
                        new Date().toISOString()

                    })
                    .eq(
                        "tripID",
                        trip.tripID
                    );

                if (error) {
                    toast.error(error.message);
                    return;
                }

                await supabase
                    .from("trip_stage_history")
                    .insert({

                    trip_id:
                        trip.tripID,

                    stage:
                        "POD Submitted"

                    });

                toast.success(
                    "POD submitted successfully"
                );
                 
                
                fetchTripDetails();
                };

        const handleSettlement = async () => {

        if (!settlementType) {
            toast.error(
            "Select settlement type"
            );
            return;
        }

        

        const { error } =
            await supabase
            .from("tripsTable")
            .update({

                current_step: 6,
                
                 tripStatus: false,

                settlement_type:
                settlementType,

                settled_at:
                new Date().toISOString()

            })
            .eq(
                "tripID",
                trip.tripID
            );

        if (error) {
            toast.error(error.message);
            return;
        }

        await supabase
            .from("trip_stage_history")
            .insert({

            trip_id:
                trip.tripID,

            stage:
                `Settlement - ${settlementType}`

            });

        toast.success(
            "Trip settled successfully"
        );
        setOpenSettlementDialog(false)
        fetchTripDetails();
        };

        const calculateProfit =
        async () => {

        const { data } =
            await supabase
            .from("trip_expenses")
            .select(
                "expense_amount"
            )
            .eq(
                "trip_id",
                trip.tripID
            );

        const totalExpense =
            data?.reduce(
            (sum, item) =>
                sum +
                Number(
                item.expense_amount
                ),
            0
            ) || 0;

        const profit =
            Number(
            trip.freightAmount
            ) -
            totalExpense;

        await supabase
            .from("tripsTable")
            .update({

            total_expense:
                totalExpense,

            trip_profit:
                profit

            })
            .eq(
            "tripID",
            trip.tripID
            );
        };

        const handleAddExpense =
                async () => {

                if (!expenseType) {
                    toast.error(
                    "Select expense type"
                    );
                    return;
                }

                if (!expenseAmount) {
                    toast.error(
                    "Enter expense amount"
                    );
                    return;
                }

                setSavingExpense(true);

                try {

                    await supabase
                    .from("trip_expenses")
                    .insert({

                        trip_id:
                        trip.tripID,

                        expense_type:
                        expenseType,

                        expense_amount:
                        Number(expenseAmount),

                        expense_date:
                        expenseDate,

                        payment_mode:
                        paymentMode,

                        add_to_party_bill:
                        addToPartyBill,

                        notes

                    });

                    await calculateProfit();

                    toast.success(
                    "Expense added successfully"
                    );

                    setOpenExpenseDialog(false);

                    fetchTripDetails();

                } catch {

                    toast.error(
                    "Failed to add expense"
                    );

                } finally {

                    setSavingExpense(false);

                }

                };
        
const handleGenerateBill = async () => {

  try {

    setGeneratingBill(true);

    const response =
      await fetch(
        "/api/generate-bill",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tripID: trip.tripID,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      toast.error(
        data.error ||
        "Failed to generate bill"
      );

      return;
    }

    toast.success(
      "Bill generated successfully"
    );

    await fetchTripDetails();

  } catch (error) {

    console.error(error);

    toast.error(
      "Something went wrong"
    );

  } finally {

    setGeneratingBill(false);

  }
};

            const handleViewBill = () => {
            if (!trip?.bill_pdf_url) return;

            window.open(
                trip.bill_pdf_url,
                "_blank"
            );
            };

            const handleDownloadBill = () => {
            if (!trip?.bill_pdf_url) return;

            const link =
                document.createElement("a");

            link.href =
                trip.bill_pdf_url;

            link.download =
                `Bill-${trip.lrNumber}.pdf`;

            link.click();
            };
        const currentStep = trip.current_step || 0;

      const progressStep = Math.max(
        0,
        Math.min(currentStep - 1, steps.length - 1)
        );

        const totalExpenses =
        expenses.reduce(
            (sum, item) =>
            sum +
            Number(
                item.expense_amount
            ),
            0
        );

        const revenue =
        Number(
            trip?.freightAmount || 0
        );

        const profit =
        revenue -
        totalExpenses;

if (loading) {
        return (
        <div className="p-6">
            Loading...
        </div>
        )
    }

   


  return (
    <div className="p-6 bg-slate-50 min-h-screen">

        {/* Header Card */}

        <div className="bg-white rounded-3xl shadow-sm border p-6">
            <div className="grid lg:grid-cols-4 gap-6">

                {/* Truck / Trip Info */}
                

                <div className="bg-white border rounded-md p-5 flex items-center justify-between">
                
                    <div className="text-5xl">🚚</div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold">
                                {trip?.truckNumber}
                            </h2>

                            <span
                                className={`text-white text-xs px-2 py-1 rounded font-semibold ${
                                trip?.ownershipType === "Market Truck"
                                    ? "bg-orange-500"
                                    : "bg-blue-600"
                                }`}
                            >
                                {trip?.ownershipType === "Market Truck"
                                ? "MARKET"
                                : "OWN"}
                            </span>
                        </div>

                        <button className="text-blue-600 mt-2">
                        View Truck →
                        </button>
                
                    </div>
                
                </div>
                <div className="bg-white border rounded-md p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">🛞</div>

                        <div>
                            <p className="text-gray-500 text-sm">
                            {trip?.ownershipType === "Market Truck"
                                ? "Supplier Name"
                                : "Driver Name"}                    
                            </p>
                            

                            <h3 className="text-3xl font-bold">
                            {trip?.ownershipType === "Market Truck"
                                ? trip?.supplierName
                                : trip?.driverName}
                            </h3>
                            <p className="text-gray-500">
                            {trip?.ownershipType ===
                            "Market Truck"
                                ? trip?.supplierMobile
                                : trip?.driverMobile}
                            </p>
                        </div>
                    </div>

                    {/* <div>›</div> */}
            
                </div>
                <div className="bg-white border rounded-md p-5 gap-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">
                            {trip?.partyName}
                        </h3>


                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Origin</p>
                                    <p className="font-semibold">{trip?.origin}</p>
                                </div>
                                </div>

                                <div className="flex-1 mx-6 border-t-2 border-dashed border-gray-300" />

                                <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Destination</p>
                                    <p className="font-semibold">{trip?.destination}</p>
                                </div>
                                <Flag className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </div>

                        {/* <p>
                        <span className="font-semibold">
                            Material:
                        </span>{" "}
                        {trip?.materialName}
                        </p> */}
                    </div>
                </div>
                <div className="bg-white border rounded-xl p-8 flex items-center justify-center min-h-[120px] shadow-sm">
                   
                       {trip.current_step === 0 && (
                            <Button
                                  size="lg"
  className="h-14 px-10 text-base font-semibold"
                                onClick={() => setOpenStartDialog(true)}
                            >
                                Trip Start
                            </Button>
                            )}
                        {trip.current_step === 1 && (
                            <Button
                              size="lg"
  className="h-14 px-10 text-base font-semibold"
                                onClick={() => setOpenUnloadingDialog(true)}
                            >
                                Unloading Completed
                            </Button>
                            )}
                        {trip.current_step === 2 && (
                           <Button
                             size="lg"
  className="h-14 px-10 text-base font-semibold"
                            onClick={() => setOpenTripCompletedDialog(true)}
                            >
                            Trip Completed
                            </Button>
                            )}

                        {trip.current_step === 3 && (
                           <Button
                             size="lg"
  className="h-14 px-10 text-base font-semibold"
                            onClick={() => setOpenPodReceivedDialog(true)}
                            >
                            POD Received
                            </Button>
                            )}
                         {trip.current_step === 4 && (
                          <Button
                            size="lg"
        className="h-14 px-10 text-base font-semibold"
                            onClick={handlePodSubmitted}
                            >
                            POD Submitted
                            </Button>
                            )}
                        {trip.current_step === 5 && (
                            <Button
                                size="lg"
                                onClick={() =>
                                setOpenSettlementDialog(true)
                                }
                                className="h-14 px-10 text-base font-semibold bg-green-600 hover:bg-green-700"
                            >
                                Settlement
                            </Button>
                            )}
                        
                        {trip.current_step === 6 && (
                            <Badge className="px-6 py-3 text-base font-semibold bg-green-600 text-white">
                            Trip Completed & Settled
                            </Badge>
                            )}



                      
                
            
                </div>
            

          

            </div>
        </div>

      <br />

            <div className="grid md:grid-cols-4 gap-4">

            <div className="bg-white rounded-3xl border p-5 shadow-sm">

            <p className="text-gray-500 text-sm">
                Freight Amount
            </p>

            <div className="flex items-center gap-1 mt-2">
                <IndianRupee
                size={20}
                className="text-blue-600"
                />

                <h2 className="text-3xl font-bold text-blue-600">
                {trip?.freightAmount || 0}
                </h2>
            </div>

            </div>

            <div className="bg-white rounded-3xl border p-5 shadow-sm">

            <p className="text-gray-500 text-sm">
                Expenses
            </p>

            <div className="flex items-center gap-1 mt-2">
                

                <h2 className="text-3xl font-bold text-red-600">
               ₹ {totalExpenses.toLocaleString()}
                </h2>
            </div>

            </div>

            <div className="bg-white rounded-3xl border p-5 shadow-sm">

            <p className="text-gray-500 text-sm">
                Profit
            </p>

            <div className="flex items-center gap-1 mt-2">
                

                <h2 className="text-3xl font-bold text-green-600">
                ₹ {profit.toLocaleString()}
                </h2>
            </div>

            </div>

            <div className="bg-white rounded-3xl border p-5 shadow-sm">

            <p className="text-gray-500 text-sm">
                Trip Status
            </p>

            <div className="mt-3">
                <span
                className={`px-3 py-1 rounded-full font-medium ${
                    trip?.current_step === 6
                    ? "bg-blue-100 text-blue-700"
                    : trip?.tripStatus
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                >
                {trip?.current_step === 6
                    ? "Settled"
                    : trip?.tripStatus
                    ? "Running"
                    : "Closed"}
                </span>
                </div>

            </div>

          </div>

            {/* Success Banner */}

            <div className="mt-6 bg-green-500 text-white rounded-xl px-5 py-4">
                <div className="bg-white rounded-xl p-6">
                    <div className="relative">
                        {/* Gray Line */}
                        <div className="absolute top-3 left-0 right-0 h-1 bg-gray-300" />

                        {/* Green Progress Line */}
                        <div
                            className="absolute top-3 left-0 h-1 bg-green-600 transition-all duration-500"
                            style={{
                                width: `${(progressStep / (steps.length - 1)) * 100}%`,
                                }}
                            />

                        <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const completed = index < currentStep;

                            return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center w-32"
                            >
                                <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                                    completed
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-300 text-transparent"
                                }`}
                                >
                                {completed && <Check size={16} />}
                                </div>

                                <p className="mt-4 text-sm font-semibold text-gray-900">
                                {step.title}
                                </p>

                               {step.date && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(step.date).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    })}
                                </p>
                                )}
                            </div>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </div>

    

         {/* Route & Details */}

        <div className="grid lg:grid-cols-2 gap-6 mt-6">

            <div className="bg-white rounded-3xl border p-6">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-2xl font-bold text-slate-900">
                Trip Profit
                </h2>

                <Button
                onClick={() =>
                    setOpenExpenseDialog(true)
                }
                >
                + Add Expense
                </Button>
            </div>

            {/* Revenue */}
            <div className="p-5">

                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    (+) Revenue
                </h3>

            {/*  <span className="text-xl font-bold text-blue-600">
                    ₹ {Number(trip?.freightAmount || 0).toLocaleString()}
                </span>*/} 
                </div> 

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">

                <div className="flex justify-between">
                    <span>Freight Amount</span>

                    <span>
                    ₹ {Number(trip?.freightAmount || 0).toLocaleString()}
                    </span>
                </div>

                {/*<div className="flex justify-between">
                    <span>Total Charges</span>
                    <span>₹ 0</span>
                </div>

                <div className="flex justify-between">
                    <span>Total Deductions</span>
                    <span>₹ 0</span>
                </div> */}

                </div>

            </div>

            {/* Expenses */}
            <div className="px-5 pb-5">

                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    (-) Expenses
                </h3>

                <span className="text-xl font-bold text-red-600">
                    ₹ {totalExpenses.toLocaleString()}
                </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">

                {expenses.length === 0 ? (

                    <div className="text-sm text-gray-500">
                    No expenses added yet
                    </div>

                ) : (

                    expenses.map((expense) => (

                    <div
                        key={expense.id}
                        className="flex justify-between"
                    >

                        <span>
                        {expense.expense_type}
                        </span>

                        <span>
                        ₹ {Number(
                            expense.expense_amount
                        ).toLocaleString()}
                        </span>

                    </div>

                    ))

                )}

                </div>

            </div>

            {/* Profit */}
            <div className="border-t p-5">

                <div className="flex justify-between items-center">

                <h3 className="text-xl font-bold">
                    Profit
                </h3>

                <span
                    className={`text-2xl font-bold ${
                    profit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                >
                    ₹ {profit.toLocaleString()}
                </span>

                </div>

            </div>

            </div>

            <div className="bg-white rounded-3xl border p-6">
                    <div className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

  {/* Start KM */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <h3 className="font-semibold text-lg mb-3">
      Start KM -  {trip?.start_km || 0}
    </h3>

    <FileViewCard
      title="Start KM Photo"
      fileUrl={trip?.start_photo}
    />
  </div>

  {/* Unloading */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <h3 className="font-semibold text-lg mb-3">
      Unloading KM - {trip?.unloading_km || 0}
    </h3>

   
    <div className="space-y-3">
      <FileViewCard
        title="KM Photo"
        fileUrl={trip?.unloading_km_photo}
      />
      <br/>

      <FileViewCard
        title="Photo"
        fileUrl={trip?.unloading_photo}
      />
    </div>
  </div>

  {/* End KM */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <h3 className="font-semibold text-lg mb-3">
      End KM - {trip?.end_km || 0}
    </h3>

   

    <FileViewCard
      title="End KM Photo"
      fileUrl={trip?.end_photo}
    />
  </div>

  {/* POD */}
  <div className="bg-white border rounded-xl p-4 shadow-sm">
    <h3 className="font-semibold text-lg mb-3">
      POD Details
    </h3>

    <FileViewCard
      title="POD Photo"
      fileUrl={trip?.pod_photo}
    />
  </div>

</div>
                        <div className="bg-white rounded-3xl border p-5  flex items-center justify-between  shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    📋
                                </div>

                                <div>
                                <h3 className="font-semibold text-lg text-lg">
                                        Billing
                                    </h3>

                                </div>
                            </div>


                            <div className="mt-4">

                                {trip?.current_step === 6 &&
                                !trip?.bill_pdf_url ? (

                                <Button
                                    onClick={handleGenerateBill}
                                    disabled={generatingBill}
                                    >
                                    {
                                        generatingBill
                                        ? "Generating PDF..."
                                        : "Generate Bill"
                                    }
                                    </Button>

                                ) : trip?.bill_pdf_url ? (

                                <div className="space-y-2">

                                    <Button
                                    className="w-full"
                                    onClick={handleViewBill}
                                    >
                                    View Bill
                                    </Button>

                                    <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleDownloadBill}
                                    >
                                    Download Bill
                                    </Button>

                                </div>

                                ) : (

                                <p className="text-sm text-gray-500">
                                    Complete settlement to generate bill
                                </p>

                                )}

                            </div>

                        </div>
                        {/* Online Bilty/LR */}
                        <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                📄
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg">Online Bilty/LR</h3>
                            </div>
                            </div>

                            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium shadow">
                            Create LR
                            </button>
                        </div> 

                        {/* POD Challan */}
                         <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                📋
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg">POD Challan</h3>
                            </div>
                            </div>

                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium shadow">
                            Add POD
                            </button>
                        </div> 

                        

                            </div>

      
                    </div>

                   
                </div>

            <Dialog
            open={openStartDialog}
            onOpenChange={setOpenStartDialog}
            >
            <DialogContent>

                <DialogHeader>
                <DialogTitle>
                    Start Trip
                </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                <Input
                     type="text"
                     inputMode="numeric"
                    placeholder="Enter Start KM"
                    value={startKm}
                    onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setStartKm(value);
                }}
                    />

                    
                <p className="text-sm font-medium">
                    KM Meter Photo *
                    </p>

                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                    setStartPhoto(
                        e.target.files?.[0] || null
                    )
                    }
                />

               <Button
                className="w-full"
                onClick={handleTripStart}
                disabled={savingStartTrip}
                >
                {savingStartTrip ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                    </>
                ) : (
                    "Save"
                )}
                </Button>

                </div>

            </DialogContent>

            </Dialog>

            <Dialog
            open={openUnloadingDialog}
            onOpenChange={setOpenUnloadingDialog}
            >
            <DialogContent>

                <DialogHeader>
                <DialogTitle>
                    Unloading Completed
                </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                   

                <Input
                      type="text"
                      inputMode="numeric"
                    placeholder="Current KM"
                    value={unloadingKm}
                   onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setUnloadingKm(value);
                }}
                    
                />

                <p className="text-sm font-medium">
                    KM Meter Photo *
                    </p>

                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                    setUnloadingKmPhoto(
                        e.target.files?.[0] || null
                    )
                    }
                />

                <p className="text-sm font-medium">
                    Unloading Photo *
                    </p>


                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                    setUnloadingPhoto(
                        e.target.files?.[0] || null
                    )
                    }
                />

                <Button
                    className="w-full"
                    onClick={handleUnloadingCompleted}
                    disabled={savingUnloading}
                    >
                    {savingUnloading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                        </>
                    ) : (
                        "Save"
                    )}
                    </Button>

                </div>

            </DialogContent>
            </Dialog>
         
            <Dialog
            open={openTripCompletedDialog}
            onOpenChange={setOpenTripCompletedDialog}
            >
            <DialogContent>

                <DialogHeader>
                <DialogTitle>
                    Trip Completed
                </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="End KM"
                    value={endKm}
                    onChange={(e) => {
                    const value =
                        e.target.value.replace(/\D/g,"");

                    setEndKm(value);
                    }}
                />

                <p>End KM Photo *</p>

                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                    setEndKmPhoto(
                        e.target.files?.[0] || null
                    )
                    }
                />

                <Button
                    className="w-full"
                    onClick={handleTripCompleted}
                    disabled={savingTripCompleted}
                    >
                    {savingTripCompleted ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                        </>
                    ) : (
                        "Save"
                    )}
                    </Button>

                </div>

            </DialogContent>
            </Dialog>

            <Dialog
        open={openPodReceivedDialog}
        onOpenChange={setOpenPodReceivedDialog}
        >
        <DialogContent>

            <DialogHeader>
            <DialogTitle>
                POD Received
            </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

            <p className="text-sm font-medium">
                POD Photo *
            </p>

            <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) =>
                setPodPhoto(
                    e.target.files?.[0] || null
                )
                }
            />

            <Textarea
                placeholder="Remarks"
                value={podRemarks}
                onChange={(e) =>
                setPodRemarks(e.target.value)
                }
            />

            <Button
                onClick={handlePodReceived}
            >
                Save
            </Button>

            </div>

        </DialogContent>
           </Dialog>

           <Dialog
  open={openSettlementDialog}
  onOpenChange={
    setOpenSettlementDialog
  }
>
  <DialogContent>

    <DialogHeader>
      <DialogTitle>
        Settlement
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">

      <div>

        <label className="text-sm font-medium">
          Settlement Type
        </label>

        <select
          value={settlementType}
          onChange={(e) =>
            setSettlementType(
              e.target.value
            )
          }
          className="w-full border rounded-md p-2 mt-2"
        >
          <option value="">
            Select Settlement
          </option>

          <option value="Cash">
            Cash
          </option>

          <option value="Online">
            Online
          </option>

        </select>

      </div>

      <Button
        className="w-full"
        onClick={handleSettlement}
      >
        Save Settlement
      </Button>

    </div>

  </DialogContent>
           </Dialog>

           <Dialog
        open={openExpenseDialog}
        onOpenChange={setOpenExpenseDialog}
        >
        <DialogContent className="sm:max-w-[500px]">

            <DialogHeader>
            <DialogTitle>
                Add Expense
            </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">

            {/* Expense Type */}

            <div>
                <label className="text-sm font-medium">
                Expense Type *
                </label>

                <select
                value={expenseType}
                onChange={(e) =>
                    setExpenseType(e.target.value)
                }
                className="w-full border rounded-md p-2 mt-1"
                >
                <option value="">
                    Select Expense Type
                </option>

                <option value="Diesel">
                    Diesel
                </option>

                <option value="Toll">
                    Toll
                </option>

                <option value="Driver Bata">
                    Driver Bata
                </option>

                <option value="Loading">
                    Loading
                </option>

                <option value="Unloading">
                    Unloading
                </option>

                <option value="Repair">
                    Repair
                </option>

                <option value="Other">
                    Other
                </option>

                </select>
            </div>

            {/* Amount */}

            <div>
                <label className="text-sm font-medium">
                Expense Amount *
                </label>

                <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter Amount"
                value={expenseAmount}
                onChange={(e) => {

                    const value =
                    e.target.value.replace(
                        /\D/g,
                        ""
                    );

                    setExpenseAmount(value);

                }}
                />
            </div>

            {/* Expense Date */}

            <div>
                <label className="text-sm font-medium">
                Expense Date *
                </label>

                <Input
                type="date"
                value={expenseDate}
                onChange={(e) =>
                    setExpenseDate(
                    e.target.value
                    )
                }
                />
            </div>

            {/* Payment Mode */}

            <div>
                <label className="text-sm font-medium">
                Payment Mode *
                </label>

                <div className="flex gap-2 mt-2">

                <Button
                    type="button"
                    variant={
                    paymentMode === "Cash"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                    setPaymentMode("Cash")
                    }
                >
                    Cash
                </Button>

                <Button
                    type="button"
                    variant={
                    paymentMode === "Credit"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                    setPaymentMode("Credit")
                    }
                >
                    Credit
                </Button>

                <Button
                    type="button"
                    variant={
                    paymentMode === "Online"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                    setPaymentMode("Online")
                    }
                >
                    Online
                </Button>

                </div>
            </div>

            {/* Add To Party Bill */}

            <div className="flex items-center gap-2">

                <input
                type="checkbox"
                checked={addToPartyBill}
                onChange={(e) =>
                    setAddToPartyBill(
                    e.target.checked
                    )
                }
                />

                <label>
                Add To Party Bill
                </label>

            </div>

            {/* Notes */}

            <div>
                <label className="text-sm font-medium">
                Notes
                </label>

                <Textarea
                placeholder="Enter Notes"
                value={notes}
                onChange={(e) =>
                    setNotes(
                    e.target.value
                    )
                }
                />
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3">

                <Button
                variant="outline"
                onClick={() =>
                    setOpenExpenseDialog(false)
                }
                >
                Close
                </Button>

                <Button
                onClick={handleAddExpense}
                disabled={savingExpense}
                >
                {savingExpense
                    ? "Saving..."
                    : "Confirm"}
                </Button>

            </div>

            </div>

        </DialogContent>
        </Dialog>
    </div>
  )
}

const FileViewCard = ({
  title,
  fileUrl,
}: {
  title: string
  fileUrl?: string
}) => {
  return (
    
<div className="text-sm text-muted-foreground">
      {fileUrl ? (       
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            {title}
          </a>
          
      ) : (
        <div className="text-sm text-muted-foreground">
          Not Uploaded
        </div>
      )}
    </div>
  )
}