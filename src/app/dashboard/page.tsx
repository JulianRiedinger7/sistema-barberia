import { AdminTimeline } from "@/components/dashboard/admin-timeline";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-light">Panel de <span className="text-primary font-bold">Gestión</span></h1>
            <AdminTimeline />
        </div>
    )
}
