import { AdminAgenda } from "@/components/dashboard/agenda/admin-agenda";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-light">Panel de <span className="text-primary font-bold">Gestión</span></h1>
            <AdminAgenda />
        </div>
    )
}
