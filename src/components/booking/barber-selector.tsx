'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { User, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

// Demo data fallback
const DEMO_BARBERS = [
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', full_name: 'Juan Pérez', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=400&auto=format&fit=crop', bio: 'Especialista en cortes clásicos y afeitado tradicional.' },
    { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', full_name: 'Carlos Gardel', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=400&auto=format&fit=crop', bio: 'Experto en degradados y estilos modernos.' },
]

export function BarberSelector({ onSelectBarber }: { onSelectBarber: (barber: any) => void }) {
    const [barbers, setBarbers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

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

    const handleSelect = (barber: any) => {
        setSelectedId(barber.id)
        onSelectBarber(barber)
    }

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
            ))}
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber) => (
                <div
                    key={barber.id}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-card border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer",
                        selectedId === barber.id ? "ring-2 ring-primary border-primary shadow-xl scale-[1.02]" : "border-border/50"
                    )}
                    onClick={() => handleSelect(barber)}
                >
                    {/* Image Area */}
                    <div className="aspect-[4/5] w-full relative overflow-hidden bg-muted">
                        {barber.avatar_url ? (
                            <img
                                src={barber.avatar_url}
                                alt={barber.full_name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <User className="w-20 h-20 text-zinc-700" />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-start text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">{barber.full_name}</h3>
                            <p className="text-sm text-zinc-300 line-clamp-3 mb-4 leading-relaxed">
                                {barber.bio || "Profesional de la barbería dedicado a brindar el mejor estilo y atención."}
                            </p>

                            <Button
                                className={cn(
                                    "w-full gap-2 font-medium transition-all",
                                    selectedId === barber.id
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "bg-white/10 text-white hover:bg-white/20 hover:text-white border-0 backdrop-blur-sm"
                                )}
                            >
                                <Scissors className="w-4 h-4" />
                                {selectedId === barber.id ? "Seleccionado" : "Elegir Barbero"}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
