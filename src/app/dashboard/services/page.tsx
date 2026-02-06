'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingService, setEditingService] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', price: '', duration_min: 30 })

    const fetchServices = async () => {
        setLoading(true)
        const { data } = await supabase.from('services').select('*').order('name')
        if (data) setServices(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar este servicio?")) return
        await supabase.from('services').delete().eq('id', id)
        fetchServices()
    }

    const openDialog = (service?: any) => {
        if (service) {
            setEditingService(service)
            setFormData({
                name: service.name,
                price: service.price.toString(),
                duration_min: service.duration_min
            })
        } else {
            setEditingService(null)
            setFormData({ name: '', price: '', duration_min: 30 })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                duration_min: parseInt(formData.duration_min as any)
            }

            if (editingService) {
                await supabase.from('services').update(payload).eq('id', editingService.id)
            } else {
                await supabase.from('services').insert(payload)
            }

            setIsDialogOpen(false)
            fetchServices()
        } catch (e) {
            console.error(e)
            alert("Error al guardar servicio")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-light">Gestión de <span className="text-primary font-bold">Servicios</span></h1>
                <Button onClick={() => openDialog()}>
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Servicio</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="price">Precio (ARS)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="duration">Duración (min)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration_min}
                                    onChange={(e) => setFormData({ ...formData, duration_min: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">{editingService ? 'Actualizar' : 'Crear'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>{service.duration_min} min</TableCell>
                                    <TableCell className="text-right text-primary font-bold">${service.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openDialog(service)}>
                                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
