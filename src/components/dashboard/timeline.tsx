'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, DollarSign, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Mock Data for "Today"
const MOCK_APPOINTMENTS = [
    { id: '1', client_name: 'Martín Fierro', service: 'Corte Clásico', time: '09:00', status: 'confirmed', price: 25 },
    { id: '2', client_name: 'Don Quijote', service: 'Afeitado Premium', time: '10:00', status: 'completed', price: 20 },
    { id: '3', client_name: 'Sancho Panza', service: 'Corte + Barba', time: '11:30', status: 'confirmed', price: 40 },
]

export function Timeline() {
    // In real app, fetch from supabase('appointments').select(...).eq('barber_id', user.id).eq('date', today)
    const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS)

    const handleStatusChange = (id: string, newStatus: string) => {
        setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app))
        // Update DB logic here
    }

    return (
        <div className="space-y-6">
            {appointments.map((app, index) => (
                <div key={app.id} className="relative pl-8 border-l-2 border-primary/20 last:border-0 pb-8">
                    {/* Time Indicator */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                    <Card className={`border-l-4 ${app.status === 'completed' ? 'border-l-green-500 opacity-75' : 'border-l-primary'}`}>
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-primary border-primary/50">
                                        <Clock className="w-3 h-3 mr-1" /> {app.time}
                                    </Badge>
                                    <span className={`text-sm capitalize ${app.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`}>{app.status === 'confirmed' ? 'Pendiente' : 'Completado'}</span>
                                </div>
                                <h3 className="text-xl font-bold">{app.client_name}</h3>
                                <p className="text-muted-foreground">{app.service} - ${app.price}</p>
                            </div>

                            <div className="flex gap-2">
                                {app.status !== 'completed' && (
                                    <>
                                        <Button size="sm" onClick={() => handleStatusChange(app.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white">
                                            <Check className="w-4 h-4 mr-2" /> Asistió
                                        </Button>
                                        <Button size="sm" variant="secondary">
                                            <DollarSign className="w-4 h-4 mr-2" /> Cobrar
                                        </Button>
                                    </>
                                )}
                                {app.status === 'completed' && (
                                    <Button size="sm" variant="ghost" disabled>
                                        <Check className="w-4 h-4 mr-2" /> Cobrado
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    )
}
