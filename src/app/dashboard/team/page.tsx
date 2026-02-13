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
                            <div className="flex items-center gap-3">
                                {barber.avatar_url ? (
                                    <img src={barber.avatar_url} alt={barber.full_name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <CardTitle className="text-lg font-medium">{barber.full_name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Clock className="w-4 h-4" />
                                <span>{barber.work_start?.slice(0, 5) || '09:00'} - {barber.work_end?.slice(0, 5) || '20:00'}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <EditScheduleDialog barber={barber} onRefresh={fetchBarbers} />
                                <EditProfileDialog barber={barber} onRefresh={fetchBarbers} />
                            </div>
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

function EditProfileDialog({ barber, onRefresh }: { barber: any, onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(barber.full_name || '')
    const [bio, setBio] = useState(barber.bio || '')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]
        setUploading(true)

        // 1. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${barber.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

        if (uploadError) {
            alert('Error al subir imagen: ' + uploadError.message)
            setUploading(false)
            return
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

        // 3. Update Profile (Auto-save on upload for simplicity, or just store state)
        // We'll just update the profile immediately here for better UX
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', barber.id)

        if (updateError) {
            alert('Error al actualizar perfil: ' + updateError.message)
        } else {
            onRefresh()
        }
        setUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Update Name (Avatar handled separately above or could be merged)
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: name, bio: bio })
            .eq('id', barber.id)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            setOpen(false)
            onRefresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                    Editar Perfil
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Perfil de {barber.full_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Biografía</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Breve descripción del barbero..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            {barber.avatar_url && <img src={barber.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />}
                            <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </div>
                        {uploading && <p className="text-sm text-yellow-500">Subiendo imagen...</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || uploading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
