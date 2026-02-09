'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const mockClients = [
    { id: '1', date: '2023-10-25', client: 'Carlos R.', service: 'Corte Fade', barber: 'Juan', notes: 'Usa la 1.5 en los lados. Piel sensible.' },
    { id: '2', date: '2023-10-24', client: 'Esteban Q.', service: 'Barba', barber: 'Carlos', notes: 'Perfilar bien las líneas. Aceite al final.' },
    { id: '3', date: '2023-10-24', client: 'Luis M.', service: 'Corte Clásico', barber: 'Juan', notes: 'Sin notas.' },
]

export function ClientHistory() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Barbero</TableHead>
                                <TableHead>Notas Técnicas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockClients.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.date}</TableCell>
                                    <TableCell className="font-medium">{c.client}</TableCell>
                                    <TableCell>{c.service}</TableCell>
                                    <TableCell>{c.barber}</TableCell>
                                    <TableCell className="text-muted-foreground italic">{c.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
