'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { PlusCircle, Clock, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBarber, updateBarberWorkHours } from '@/app/actions/team-actions'

export default function TeamPage() {
    const [barbers, setBarbers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBarbers = async () => {
        setLoading(true)
        const { data } = await supabase.from('profiles').select('*').eq('role', 'barber')
        if (data) setBarbers(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchBarbers()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-light">Gestión de <span className="text-primary font-bold">Equipo</span></h1>
                <AddBarberDialog onRefresh={fetchBarbers} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {barbers.map(barber => (
                    <Card key={barber.id}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">{barber.full_name}</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Clock className="w-4 h-4" />
                                <span>{barber.work_start?.slice(0, 5) || '09:00'} - {barber.work_end?.slice(0, 5) || '20:00'}</span>
                            </div>
                            <EditScheduleDialog barber={barber} onRefresh={fetchBarbers} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function AddBarberDialog({ onRefresh }: { onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createBarber(name, '') // Email optional or generated
        if (res.success) {
            setOpen(false)
            setName('')
            onRefresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Nuevo Barbero
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Barbero</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Guardando...' : 'Crear Perfil'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditScheduleDialog({ barber, onRefresh }: { barber: any, onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [start, setStart] = useState(barber.work_start || '09:00')
    const [end, setEnd] = useState(barber.work_end || '20:00')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await updateBarberWorkHours(barber.id, start, end)
        if (res.success) {
            setOpen(false)
            onRefresh()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    Editar Horario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Horario de {barber.full_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Inicio</Label>
                            <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Fin</Label>
                            <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Guardando...' : 'Actualizar Horario'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
