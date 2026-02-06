'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function ClientsPage() {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true)
            const { data } = await supabase
                .from('appointments')
                .select(`
                    id,
                    slot,
                    status,
                    guest_name,
                    guest_email,
                    guest_phone,
                    client_id,
                    profiles:barber_id (full_name),
                    services:service_id (name, price)
                `)
                .order('slot', { ascending: false })
                .limit(50) // Last 50 visits

            if (data) setHistory(data)
            setLoading(false)
        }
        fetchHistory()
    }, [])

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-light">Historial de <span className="text-primary font-bold">Clientes</span></h1>

            <Card>
                <CardHeader>
                    <CardTitle>Últimas Visitas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Profesional</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((record) => {
                                const startStr = record.slot.replace(/[\[\(\)\"\]]/g, '').split(',')[0]
                                const date = new Date(startStr)

                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>{format(date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell className="font-medium">
                                            {record.guest_name || `ID: ${record.client_id?.slice(0, 8)}...`}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {record.guest_email || '-'}
                                        </TableCell>
                                        <TableCell>{record.services?.name}</TableCell>
                                        <TableCell>{record.profiles?.full_name}</TableCell>
                                        <TableCell>
                                            {record.status === 'completed' && <Badge variant="secondary">Completado</Badge>}
                                            {record.status === 'confirmed' && <Badge className="bg-green-500/10 text-green-500">Reservado</Badge>}
                                            {record.status === 'cancelled' && <Badge variant="destructive">Cancelado</Badge>}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
