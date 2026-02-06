'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { Clock, Scissors } from 'lucide-react'

// Demo data in case DB is empty
const DEMO_SERVICES = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Corte Clásico', price: 25.00, duration_min: 30, image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Afeitado Premium', price: 20.00, duration_min: 30, image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Corte + Barba', price: 40.00, duration_min: 60, image_url: 'https://images.unsplash.com/photo-1503951914205-9847b367c3b1?q=80&w=600&auto=format&fit=crop' },
]

export function ServiceGrid({ onSelectService }: { onSelectService: (service: any) => void }) {
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchServices() {
            try {
                const { data, error } = await supabase.from('services').select('*')
                if (data && data.length > 0) {
                    setServices(data)
                } else {
                    setServices(DEMO_SERVICES)
                }
            } catch (e) {
                console.error("Error fetching services", e)
                setServices(DEMO_SERVICES)
            } finally {
                setLoading(false)
            }
        }
        fetchServices()
    }, [])

    if (loading) return <div className="text-center p-10">Cargando servicios...</div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
                <Card key={service.id} className="group hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => onSelectService(service)}>
                    <div className="h-48 overflow-hidden relative">
                        {/* Placeholder or Image */}
                        {service.image_url ? (
                            <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <Scissors className="w-12 h-12 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-xl">
                            <span>{service.name}</span>
                            <span className="text-primary font-bold">${service.price}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{service.duration_min} min</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Reservar</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
