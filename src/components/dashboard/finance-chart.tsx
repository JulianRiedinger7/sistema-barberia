'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChartData {
    name: string
    date: string
    income: number
    expense: number
}

export function FinanceChart() {
    const [data, setData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Get last 7 days range
            const end = endOfDay(new Date())
            const start = startOfDay(subDays(new Date(), 6))

            const { data: rawData } = await supabase
                .from('finances')
                .select('*')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())

            // Initial blank data for last 7 days
            const chartData: ChartData[] = []
            for (let i = 6; i >= 0; i--) {
                const d = subDays(new Date(), i)
                const dayName = format(d, 'EEE', { locale: es }) // Lun, Mar, etc.
                const dayKey = format(d, 'yyyy-MM-dd')

                chartData.push({
                    name: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalize
                    date: dayKey,
                    income: 0,
                    expense: 0
                })
            }

            // Aggregate data
            if (rawData) {
                rawData.forEach((record: any) => {
                    const recordDate = format(new Date(record.created_at), 'yyyy-MM-dd')
                    const dayEntry = chartData.find(d => d.date === recordDate)
                    if (dayEntry) {
                        if (record.type === 'income') {
                            dayEntry.income += record.amount
                        } else {
                            dayEntry.expense += record.amount
                        }
                    }
                })
            }

            setData(chartData)
            setLoading(false)
        }
        fetchData()
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ingresos vs Gastos (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Cargando datos...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    itemStyle={{ color: '#ededed' }}
                                    formatter={(value: any) => [`$${value}`, undefined] as [string, undefined]}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Ingresos" fill="#d4af37" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Gastos" fill="#7f1d1d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
