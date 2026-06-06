
import DashboardLayout from "@/components/DashboardLayout.tsx"
import TripPage from "@/components/tripdetails/TripPage"
import TripViewPage from "@/components/tripdetails/TripViewPage"


export default function DashboardPage() {
  return (
    <DashboardLayout>
        <TripViewPage />
    </DashboardLayout>
  )
}
