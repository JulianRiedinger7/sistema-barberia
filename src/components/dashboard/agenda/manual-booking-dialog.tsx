'use client'

import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createManualAppointment } from '@/app/actions/admin-actions'
import { supabase } from '@/utils/supabase/client'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

interface ManualBookingDialogProps {
    date: Date
    barberId: string
    onSuccess: () => void
}

export function ManualBookingDialog({ date, barberId, onSuccess }: ManualBookingDialogProps) {
    const [open, setOpen] = useState(false)
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Form State
    const [guestName, setGuestName] = useState('')
    const [serviceId, setServiceId] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')

    useEffect(() => {
        if (open) {
            async function fetchServices() {
                const { data } = await supabase.from('services').select('*')
                if (data) setServices(data)
            }
            fetchServices()
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await createManualAppointment({
            barberId,
            serviceId,
            date,
            guestName,
            guestEmail,
            guestPhone
        })

        if (res.success) {
            setOpen(false)
            setGuestName('')
            setServiceId('')
            toast.success('Turno agendado correctamente')
            onSuccess()
        } else {
            toast.error(res.error || 'Error al agendar turno')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-full w-full hover:bg-primary/20">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo Turno Manual</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-sm text-muted-foreground">
                    <p>Fecha: {format(date, 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre del Cliente (Guest)</Label>
                        <Input
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Servicio</Label>
                        <Select value={serviceId} onValueChange={setServiceId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} - ${s.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email (Opcional)</Label>
                            <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono (Opcional)</Label>
                            <Input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Confirmando...' : 'Confirmar Turno'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
