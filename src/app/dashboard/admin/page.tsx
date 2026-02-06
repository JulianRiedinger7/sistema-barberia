import { FinanceChart } from '@/components/dashboard/finance-chart'
import { ClientHistory } from '@/components/dashboard/client-history'

export default function AdminDashboard() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-primary">Panel de Administración</h1>
                <p className="text-muted-foreground">Visión general del negocio.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <FinanceChart />
                {/* Placeholder for another chart or stat */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <span className="text-4xl font-bold text-primary">$1,250</span>
                        <span className="text-sm text-muted-foreground mt-2">Ingresos Hoy</span>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        <span className="text-4xl font-bold text-foreground">15</span>
                        <span className="text-sm text-muted-foreground mt-2">Clientes Nuevos</span>
                    </div>
                </div>
            </div>

            <ClientHistory />
        </div>
    )
}
