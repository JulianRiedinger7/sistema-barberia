'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ClientStats {
    email: string
    name: string
    phone: string
    totalVisits: number
    lastVisit: Date
    status: 'registered' | 'guest'
}

export default function ClientsPage() {
    const [clients, setClients] = useState<ClientStats[]>([])
    const [filteredClients, setFilteredClients] = useState<ClientStats[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const lowerSearch = search.toLowerCase()
        const filtered = clients.filter(c =>
            c.name.toLowerCase().includes(lowerSearch) ||
            c.email.toLowerCase().includes(lowerSearch) ||
            c.phone.includes(lowerSearch)
        )
        setFilteredClients(filtered)
    }, [search, clients])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // 1. Fetch Profiles (Registered Users)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')

            const profileMap = new Map(profiles?.map(p => [p.id, p]))

            // 2. Fetch Appointments (History)
            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
                    id,
                    slot,
                    status,
                    guest_name,
                    guest_email,
                    guest_phone,
                    client_id,
                    profiles:client_id (full_name, email),
                    services:service_id (name, price)
                `)
                .order('slot', { ascending: false })

            if (appointments) {
                const clientMap = new Map<string, ClientStats>()

                appointments.forEach(appt => {
                    // Start parsing date strings like "[2024-02-12 10:00:00+00, ...)"
                    const startStr = appt.slot.replace(/[\[\(\)\"\]]/g, '').split(',')[0]
                    const date = new Date(startStr)

                    // Determine Identity
                    let email = appt.guest_email
                    let name = appt.guest_name
                    let phone = appt.guest_phone
                    let status: 'registered' | 'guest' = 'guest'

                    // If registered, override with profile data
                    if (appt.client_id && profileMap.has(appt.client_id)) {
                        const profile = profileMap.get(appt.client_id)
                        // Use profile email if available, fallback to guest email if missing in profile
                        email = profile.email || email
                        name = profile.full_name
                        status = 'registered'
                    }

                    // Key for aggregation: Email is primary. 
                    // Fallback to Name if no email (e.g. manual walk-in without email)
                    const key = email || `no-email-${name}`

                    if (!clientMap.has(key)) {
                        clientMap.set(key, {
                            email: email || '-',
                            name: name || 'Desconocido',
                            phone: phone || '-',
                            totalVisits: 0,
                            lastVisit: date,
                            status: status
                        })
                    }

                    const stats = clientMap.get(key)!
                    stats.totalVisits += 1
                    // Update last visit if this appointment is newer
                    if (date > stats.lastVisit) {
                        stats.lastVisit = date
                        stats.phone = phone || stats.phone // Update phone if newer is available
                    }
                })

                const list = Array.from(clientMap.values())
                setClients(list)
                setFilteredClients(list)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <h1 className="text-3xl font-light">Cartera de <span className="text-primary font-bold">Clientes</span></h1>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado Unificado</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-center">Visitas</TableHead>
                                <TableHead className="text-right">Última Visita</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell className="text-center font-bold">{client.totalVisits}</TableCell>
                                    <TableCell className="text-right">
                                        {format(client.lastVisit, 'dd MMM yyyy', { locale: es })}
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
