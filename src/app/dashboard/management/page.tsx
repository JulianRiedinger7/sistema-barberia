'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/utils/supabase/client'
import { DollarSign, TrendingUp, TrendingDown, Scissors, AlertCircle, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { RegisterExpenseDialog } from '@/components/dashboard/register-expense-dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function ManagementPage() {
    const [month, setMonth] = useState(new Date().getMonth().toString())
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        haircutCount: 0
    })
    const [dailyData, setDailyData] = useState<any[]>([])
    const [peakHours, setPeakHours] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])

    const fetchData = useCallback(async () => {
        setLoading(true)
        const startDate = startOfMonth(new Date(parseInt(year), parseInt(month)))
        const endDate = endOfMonth(startDate)

        // 1. Fetch Appointments (Income & Operations)
        const { data: appointments, error: appError } = await supabase
            .from('appointments')
            .select(`
                slot, 
                status, 
                services (
                    price
                )
            `)
            .gte('slot', startDate.toISOString())
            .lte('slot', endDate.toISOString())
            .in('status', ['confirmed', 'completed'])

        if (appError) {
            console.error('Error fetching appointments:', appError)
            toast.error('Error al cargar turnos')
        }

        // 2. Fetch Finances (Expenses & Manual Income)
        const { data: finances, error: finError } = await supabase
            .from('finances')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false })

        if (finError) {
            console.error('Error fetching finances:', finError)
            toast.error('Error al cargar finanzas')
        }

        // Process Data
        let income = 0
        let expenses = 0
        let count = 0
        const hoursMap = new Array(24).fill(0)
        const daysMap = new Map()

        // Initialize days
        eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
            daysMap.set(format(day, 'yyyy-MM-dd'), { date: format(day, 'dd'), income: 0, expenses: 0 })
        })

        // Process Appointments
        appointments?.forEach((app: any) => {
            const price = app.services?.price || 0
            income += price
            count += 1

            // Peak Hours
            // Simple extraction of start time from range string
            // Postgres range [2024-02-17 10:00:00+00,...)
            const match = app.slot.match(/\[(.*?)\,/)
            let dateObj = new Date()
            if (match) {
                dateObj = new Date(match[1])
            } else {
                const d = new Date(app.slot)
                if (!isNaN(d.getTime())) dateObj = d
            }

            if (!isNaN(dateObj.getTime())) {
                hoursMap[dateObj.getHours()] += 1

                // Daily Chart
                const dayKey = format(dateObj, 'yyyy-MM-dd')
                if (daysMap.has(dayKey)) {
                    const day = daysMap.get(dayKey)
                    day.income += price
                }
            }
        })

        // Process Finances
        finances?.forEach(fin => {
            const date = new Date(fin.created_at)

            if (fin.type === 'income') {
                income += fin.amount
                const dayKey = format(date, 'yyyy-MM-dd')
                if (daysMap.has(dayKey)) {
                    daysMap.get(dayKey).income += fin.amount
                }
            } else {
                expenses += fin.amount
                const dayKey = format(date, 'yyyy-MM-dd')
                if (daysMap.has(dayKey)) {
                    daysMap.get(dayKey).expenses += fin.amount
                }
            }
        })

        setMetrics({
            totalIncome: income,
            totalExpenses: expenses,
            netProfit: income - expenses,
            haircutCount: count
        })

        setTransactions(finances || [])
        setDailyData(Array.from(daysMap.values()))
        setPeakHours(hoursMap.map((val, hour) => ({ hour: `${hour}:00`, count: val })).filter(h => h.count > 0))
        setLoading(false)
    }, [month, year])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-light">Panel de <span className="text-primary font-bold">Gestión</span></h1>

                <div className="flex gap-2">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                    {format(new Date(2024, i, 1), 'MMMM', { locale: es })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            {['2024', '2025', '2026'].map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <RegisterExpenseDialog onExpenseAdded={fetchData} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${metrics.netProfit.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cortes Realizados</CardTitle>
                        <Scissors className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.haircutCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Balance Mensual (Ingresos vs Gastos)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Peak Hours Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Horarios Pico (Demanda)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHours}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="count" name="Turnos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay movimientos registrados en este período.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell className="capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{t.category}</TableCell>
                                        <TableCell>{t.description || '-'}</TableCell>
                                        <TableCell className={`text-right font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            {t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={async () => {
                                                if (!confirm('¿Estás seguro de eliminar este registro?')) return
                                                const { error } = await supabase.from('finances').delete().eq('id', t.id)
                                                if (error) toast.error('Error al eliminar')
                                                else { toast.success('Registro eliminado'); fetchData() }
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
