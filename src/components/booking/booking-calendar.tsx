'use client'

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function BookingCalendar({ barberId, onSelectSlot }: { barberId: string, onSelectSlot: (slot: Date) => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [slots, setSlots] = useState<Date[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)

    useEffect(() => {
        if (!date || !barberId) return

        async function fetchSlots() {
            setLoading(true)
            setSlots([])
            try {
                const formattedDate = format(date!, 'yyyy-MM-dd')
                const { data, error } = await supabase.rpc('get_available_slots', {
                    p_barber_id: barberId,
                    p_date: formattedDate
                })

                if (error) throw error

                if (data) {
                    const now = new Date()
                    const validSlots = data
                        .map((d: any) => new Date(d.slot_start))
                        .filter((slot: Date) => slot > now) // Filter past slots
                    setSlots(validSlots)
                } else {
                    setSlots([])
                }

            } catch (e) {
                console.error("Error fetching slots", e)
            } finally {
                setLoading(false)
            }
        }
        fetchSlots()
    }, [date, barberId])

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border bg-card"
                    locale={es}
                    fromDate={new Date()}
                />
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">
                    Horarios disponibles para {date ? format(date, 'EEEE d MMMM', { locale: es }) : ''}
                </h3>

                {loading ? (
                    <div>Cargando horarios...</div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {slots.map((slot, i) => (
                            <Button
                                key={i}
                                variant={selectedSlot === slot ? "default" : "outline"}
                                className={selectedSlot === slot ? "bg-primary text-primary-foreground" : "border-input"}
                                onClick={() => {
                                    setSelectedSlot(slot)
                                    onSelectSlot(slot)
                                }}
                            >
                                {format(slot, 'HH:mm')}
                            </Button>
                        ))}
                        {slots.length === 0 && <p className="col-span-3 text-muted-foreground">No hay turnos disponibles.</p>}
                    </div>
                )}
            </div>
        </div>
    )
}
