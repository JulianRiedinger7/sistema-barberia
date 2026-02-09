'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Scissors, Calendar, DollarSign, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

const items = [
    { title: 'Agenda', href: '/dashboard', icon: Calendar },
    { title: 'Servicios', href: '/dashboard/services', icon: Scissors },
    { title: 'Equipo', href: '/dashboard/team', icon: Users },
    { title: 'Clientes', href: '/dashboard/clients', icon: Users },
    { title: 'Finanzas', href: '/dashboard/finance', icon: DollarSign },
]

export function DashboardSidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className={cn("w-64 border-r bg-card/50 hidden md:flex flex-col h-screen fixed", className)}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary">StyleSync</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.title}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-500" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </aside>
    )
}
