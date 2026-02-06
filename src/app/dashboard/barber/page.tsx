import { Timeline } from '@/components/dashboard/timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BarberDashboard() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Hola, Barber</h1>
                    <p className="text-muted-foreground">Tu agenda para hoy.</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Citas Hoy</p>
                </div>
            </header>

            <Timeline />
        </div>
    )
}
