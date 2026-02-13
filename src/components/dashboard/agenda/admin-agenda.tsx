'use client'

import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { format, addDays, startOfDay, addHours, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { ManualBookingDialog } from './manual-booking-dialog'
import { cancelAppointment, markAppointmentCompleted } from '@/app/actions/admin-actions'
import { Badge } from '@/components/ui/badge'

export function AdminAgenda() {
    const [date, setDate] = useState<Date>(new Date())
    const [barbers, setBarbers] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Hours range: 09:00 to 20:00 (Display)
    const hours = Array.from({ length: 12 }, (_, i) => i + 9) // 9 to 20

    const fetchData = async () => {
        setLoading(true)
        // 1. Fetch Barbers
        const { data: barbersData } = await supabase.from('profiles').select('*').eq('role', 'barber')
        if (barbersData) setBarbers(barbersData)

        // 2. Fetch Appointments for the date
        // Note: We need a range for the whole day in UTC
        // Simplified: Fetch all and filter client-side for prototype speed, 
        // or use proper range query (ideal).
        const start = startOfDay(date).toISOString()
        const end = addDays(startOfDay(date), 1).toISOString()

        const { data: apptsData } = await supabase
            .from('appointments')
            .select('*, profiles:client_id(full_name), services(name, price)')
            .or(`status.eq.confirmed,status.eq.completed,status.eq.cancelled`)
        // We filter by range in post-process or advanced query if needed, 
        // but `get_available_slots` handles logic. Here we just want display.
        // Let's filter client-side to be safe with timezone edges in fetching.

        if (apptsData) {
            // Filter strictly by day
            const dayAppts = apptsData.filter(a => {
                // Parse slot start
                // Format: ["2024-02-13 10:00:00+00","2024-02-13 11:00:00+00")
                // Remove [ ) "
                const cleanSlot = a.slot.replace(/[\[\]\)\(\"]/g, '')
                const startTimeStr = cleanSlot.split(',')[0]
                const slotStart = new Date(startTimeStr)
                return isSameDay(slotStart, date)
            })
            setAppointments(dayAppts)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [date])

    const handleNextDay = () => setDate(addDays(date, 1))
    const handlePrevDay = () => setDate(addDays(date, -1))

    const getAppointmentForSlot = (barberId: string, hour: number) => {
        return appointments.find(a => {
            const cleanSlot = a.slot.replace(/[\[\]\)\(\"]/g, '')
            const startTimeStr = cleanSlot.split(',')[0]
            const slotStart = new Date(startTimeStr)
            return a.barber_id === barberId && slotStart.getHours() === hour && a.status !== 'cancelled'
        })
    }

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "PPP", { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={fetchData} variant="secondary" className="gap-2" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto border rounded-xl bg-card">
                <div className="min-w-[800px]">
                    {/* Header Row: Barbers */}
                    <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] border-b">
                        <div className="p-4 font-bold text-center border-r bg-muted/50">Hora</div>
                        {barbers.map(barber => (
                            <div key={barber.id} className="p-4 font-semibold text-center border-r last:border-r-0 flex items-center justify-center gap-2 bg-muted/20">
                                {barber.avatar_url && <img src={barber.avatar_url} className="w-6 h-6 rounded-full" />}
                                {barber.full_name}
                            </div>
                        ))}
                    </div>

                    {/* Time Slots Rows */}
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] border-b last:border-b-0 h-32">
                            {/* Time Column */}
                            <div className="p-4 text-center border-r font-mono text-muted-foreground bg-muted/50 flex items-center justify-center">
                                {hour}:00
                            </div>

                            {/* Appointment Cells */}
                            {barbers.map(barber => {
                                const appt = getAppointmentForSlot(barber.id, hour)

                                // Check if Barber is working this hour (simplified, can improve with actual schedule check)
                                // We can use the 'work_start' and 'work_end' from profile if we want to gray out
                                const startWork = parseInt(barber.work_start?.split(':')[0] || '9')
                                const endWork = parseInt(barber.work_end?.split(':')[0] || '20')
                                const isWorking = hour >= startWork && hour < endWork

                                if (!isWorking) {
                                    return (
                                        <div key={barber.id} className="border-r last:border-r-0 bg-secondary/30 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground/50">No Disponible</span>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={barber.id} className="border-r last:border-r-0 relative p-1">
                                        {appt ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Card className={cn(
                                                        "h-full flex flex-col justify-between p-2 shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]",
                                                        appt.status === 'completed' ? "border-l-green-500 bg-green-500/10" : "border-l-primary bg-card"
                                                    )}>
                                                        <div>
                                                            <div className="font-bold text-sm truncate">
                                                                {appt.profiles?.full_name || appt.guest_name || 'Sin Nombre'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {appt.services?.name}
                                                            </div>
                                                            <div className="mt-1">
                                                                {appt.status === 'completed' ? (
                                                                    <Badge variant="outline" className="text-[10px] border-green-500 text-green-500 w-full justify-center">Pagado</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-[10px] w-full justify-center text-muted-foreground">Confirmado</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-3">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="font-semibold leading-none">{appt.profiles?.full_name || appt.guest_name}</h4>
                                                            <p className="text-sm text-muted-foreground">{appt.services?.name} - ${appt.services?.price}</p>
                                                        </div>

                                                        {appt.status === 'confirmed' && (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                                                    onClick={async () => {
                                                                        toast.promise(
                                                                            async () => {
                                                                                await cancelAppointment(appt.id)
                                                                                fetchData()
                                                                            },
                                                                            {
                                                                                loading: 'Cancelando turno...',
                                                                                success: 'Turno cancelado',
                                                                                error: 'Error al cancelar'
                                                                            }
                                                                        )
                                                                    }}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                                <Button
                                                                    className="w-full"
                                                                    onClick={async () => {
                                                                        toast.promise(
                                                                            async () => {
                                                                                await markAppointmentCompleted(appt.id, appt.services.price, appt.services.name)
                                                                                fetchData()
                                                                            },
                                                                            {
                                                                                loading: 'Procesando cobro...',
                                                                                success: 'Turno cobrado y registrado',
                                                                                error: 'Error al cobrar'
                                                                            }
                                                                        )
                                                                    }}
                                                                >
                                                                    Cobrar
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {appt.status === 'completed' && (
                                                            <div className="text-center text-sm font-medium text-green-500 bg-green-500/10 py-2 rounded">
                                                                ¡Turno Completado y Pagado!
                                                            </div>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            (() => {
                                                const slotDate = new Date(date)
                                                slotDate.setHours(hour, 0, 0, 0)
                                                const now = new Date()
                                                const isPast = slotDate < now

                                                if (isPast) {
                                                    return (
                                                        <div className="h-full flex items-center justify-center bg-muted/10">
                                                            <span className="text-xs text-muted-foreground/30 select-none">Pasado</span>
                                                        </div>
                                                    )
                                                }

                                                return (
                                                    <ManualBookingDialog
                                                        date={slotDate}
                                                        barberId={barber.id}
                                                        onSuccess={fetchData}
                                                    />
                                                )
                                            })()
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
