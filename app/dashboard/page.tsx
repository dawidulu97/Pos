"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { SalesTargetCard } from "@/components/dashboard/sales-target-card"
import { CustomerSatisfactionCard } from "@/components/dashboard/customer-satisfaction-card"
import { StatisticsChart } from "@/components/dashboard/statistics-chart"
import { useSupabase } from "@/lib/supabase-context"
import type { Order } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/lib/settings-context"

export default function DashboardPage() {
  const { dbOperations } = useSupabase()
  const { settings } = useSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch orders via the new server route
        const ordersResponse = await fetch("/api/orders/fetch")
        const ordersResult = await ordersResponse.json()

        if (ordersResponse.ok) {
          setOrders(ordersResult.orders || [])
        } else {
          throw new Error(ordersResult.error || "Failed to fetch orders")
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err)
        setError(err.message || "An unknown error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const {
    totalSales,
    averageOrderValue,
    totalOrders,
    completedOrders,
    pendingOrders,
    voidedOrders,
    refundedOrders,
    salesDataForChart,
  } = useMemo(() => {
    let totalSales = 0
    let totalOrderValueSum = 0
    let completedOrders = 0
    let pendingOrders = 0
    let voidedOrders = 0
    let refundedOrders = 0

    const dailySales: { [key: string]: number } = {} // YYYY-MM-DD -> sales

    orders.forEach((order) => {
      const orderTotal = order.total_amount || order.total || 0
      totalOrderValueSum += orderTotal

      const orderDate = new Date(order.created_at).toISOString().split("T")[0] // YYYY-MM-DD
      dailySales[orderDate] = (dailySales[orderDate] || 0) + orderTotal

      switch (order.status) {
        case "completed":
          totalSales += orderTotal
          completedOrders++
          break
        case "pending":
          pendingOrders++
          break
        case "voided":
          voidedOrders++
          break
        case "refunded":
          refundedOrders++
          break
        default:
          break
      }
    })

    const averageOrderValue = totalOrders > 0 ? totalOrderValueSum / orders.length : 0

    // Prepare data for chart (last 7 days)
    const salesDataForChart = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const formattedDate = date.toISOString().split("T")[0]
      salesDataForChart.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sales: dailySales[formattedDate] || 0,
      })
    }

    return {
      totalSales,
      averageOrderValue,
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      voidedOrders,
      refundedOrders,
      salesDataForChart,
    }
  }, [orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Sales"
        value={formatCurrency(totalSales, settings.currencySymbol, settings.decimalPlaces)}
        description="Total revenue from completed orders"
      />
      <MetricCard title="Total Orders" value={totalOrders.toString()} description="Total number of orders placed" />
      <MetricCard
        title="Average Order Value"
        value={formatCurrency(averageOrderValue, settings.currencySymbol, settings.decimalPlaces)}
        description="Average value per order"
      />
      <MetricCard
        title="Completed Orders"
        value={completedOrders.toString()}
        description="Orders successfully fulfilled"
      />
      <MetricCard title="Pending Orders" value={pendingOrders.toString()} description="Orders awaiting fulfillment" />
      <MetricCard
        title="Voided Orders"
        value={voidedOrders.toString()}
        description="Orders cancelled before completion"
      />
      <MetricCard
        title="Refunded Orders"
        value={refundedOrders.toString()}
        description="Orders that have been refunded"
      />

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sales Over Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <StatisticsChart data={salesDataForChart} />
        </CardContent>
      </Card>

      <SalesTargetCard currentSales={totalSales} targetSales={10000} />
      <CustomerSatisfactionCard />
    </div>
  )
}
