'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle } from 'lucide-react'
import { registerExpense } from '@/app/actions/expense-actions'

export function RegisterExpenseDialog({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await registerExpense(
            Number(formData.amount),
            formData.category,
            formData.description
        )

        if (result.success) {
            setOpen(false)
            setFormData({ amount: '', category: '', description: '' })
            if (onExpenseAdded) onExpenseAdded()
        } else {
            alert("Error al registrar gasto: " + result.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Registrar Gasto
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Monto ($)</Label>
                        <Input
                            type="number"
                            required
                            min="0"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select onValueChange={val => setFormData({ ...formData, category: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Insumos">Insumos (Cera, Cuchillas, etc.)</SelectItem>
                                <SelectItem value="Alquiler">Alquiler / Local</SelectItem>
                                <SelectItem value="Servicios">Luz / Gas / Internet</SelectItem>
                                <SelectItem value="Sueldos">Sueldos / Comisiones</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input
                            placeholder="Detalle del gasto..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Registrando...' : 'Confirmar Gasto'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
