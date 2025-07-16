"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface StatisticsChartProps {
  data: { date: string; sales: number }[]
}

export function StatisticsChart({ data }: StatisticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
          labelFormatter={(label: string) => `Date: ${label}`}
        />
        <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
