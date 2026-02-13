'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/utils/supabase/client'
import { DollarSign, TrendingUp, TrendingDown, Scissors, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { RegisterExpenseDialog } from '@/components/dashboard/register-expense-dialog'

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

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const startDate = startOfMonth(new Date(parseInt(year), parseInt(month)))
            const endDate = endOfMonth(startDate)

            // 1. Fetch Appointments (Income & Operations)
            const { data: appointments } = await supabase
                .from('appointments')
                .select('slot, price, status')
                .gte('slot', startDate.toISOString())
                .lte('slot', endDate.toISOString())
                .eq('status', 'confirmed') // Only confirmed generate income? Or completed? Assuming confirmed/completed for now.

            // 2. Fetch Finances (Expenses & Manual Income)
            const { data: finances } = await supabase
                .from('finances')
                .select('*')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString())

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
            appointments?.forEach(app => {
                income += app.price || 0
                count += 1

                // Peak Hours
                const date = new Date(app.slot)
                hoursMap[date.getHours()] += 1

                // Daily Chart
                const dayKey = format(date, 'yyyy-MM-dd')
                if (daysMap.has(dayKey)) {
                    const day = daysMap.get(dayKey)
                    day.income += app.price || 0
                }
            })

            // Process Finances
            finances?.forEach(fin => {
                if (fin.type === 'income') {
                    income += fin.amount
                    // Manual income might not have a slot time for peak hours, but adds to daily chart
                    const dayKey = format(new Date(fin.date), 'yyyy-MM-dd')
                    if (daysMap.has(dayKey)) {
                        daysMap.get(dayKey).income += fin.amount
                    }
                } else {
                    expenses += fin.amount
                    const dayKey = format(new Date(fin.date), 'yyyy-MM-dd')
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

            setDailyData(Array.from(daysMap.values()))
            setPeakHours(hoursMap.map((val, hour) => ({ hour: `${hour}:00`, count: val })).filter(h => h.count > 0))
            setLoading(false)
        }

        fetchData()
    }, [month, year])

    return (
        <div className="space-y-8">
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
                    <RegisterExpenseDialog onExpenseAdded={() => { /* minimal refresh logic or full reload */ window.location.reload() }} />
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
                        <CardTitle>balance Mensual (Ingresos vs Gastos)</CardTitle>
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
        </div>
    )
}
