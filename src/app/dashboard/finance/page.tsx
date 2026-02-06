'use client'

import { FinanceChart } from "@/components/dashboard/finance-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"

import { RegisterExpenseDialog } from "@/components/dashboard/register-expense-dialog"

export default function FinancePage() {
    const [totalRevenue, setTotalRevenue] = useState(0)
    // Force re-fetch trigger
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function fetchMetrics() {
            const { data } = await supabase.from('finances').select('amount, type')
            if (data) {
                const income = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
                const expense = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
                setTotalRevenue(income - expense)
            }
        }
        fetchMetrics()
    }, [refreshKey])

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-light">Reporte <span className="text-primary font-bold">Financiero</span></h1>
                <RegisterExpenseDialog onExpenseAdded={() => setRefreshKey(k => k + 1)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Netos</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue}</div>
                        <p className="text-xs text-muted-foreground">+20.1% del mes pasado</p>
                    </CardContent>
                </Card>
            </div>

            <FinanceChart key={refreshKey} />
        </div>
    )
}
