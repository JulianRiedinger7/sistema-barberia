'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { User } from 'lucide-react'

// Demo data
const DEMO_BARBERS = [
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', full_name: 'Juan Pérez', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&auto=format&fit=crop', specialty: 'Navaja Clásica' },
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', full_name: 'Carlos Gardel', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=200&auto=format&fit=crop', specialty: 'Fade Master' },
]

export function BarberSelector({ onSelectBarber }: { onSelectBarber: (barber: any) => void }) {
    const [barbers, setBarbers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBarbers() {
            try {
                const { data, error } = await supabase.from('profiles').select('*').eq('role', 'barber')
                if (data && data.length > 0) {
                    setBarbers(data)
                } else {
                    setBarbers(DEMO_BARBERS)
                }
            } catch (e) {
                setBarbers(DEMO_BARBERS)
            } finally {
                setLoading(false)
            }
        }
        fetchBarbers()
    }, [])

    if (loading) return <div>Cargando barberos...</div>

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {barbers.map((barber) => (
                <Card key={barber.id} className="cursor-pointer hover:border-primary transition-all text-center p-4 group" onClick={() => onSelectBarber(barber)}>
                    <CardContent className="pt-6 flex flex-col items-center">
                        <Avatar className="w-24 h-24 mb-4 border-2 border-primary/20 group-hover:border-primary transition-colors">
                            <AvatarImage src={barber.avatar_url} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold mb-1">{barber.full_name}</h3>
                        <p className="text-sm text-muted-foreground text-center line-clamp-3 italic">
                            "{barber.bio || 'Barbero Profesional'}"
                        </p>
                        <Button variant="outline" className="mt-4 border-primary/50 text-foreground group-hover:bg-primary group-hover:text-primary-foreground">Seleccionar</Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
