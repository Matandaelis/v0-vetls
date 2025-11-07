"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"

interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export function ViewerTrendChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Viewer Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="viewers" stroke="#3b82f6" name="Viewers" />
          <Line type="monotone" dataKey="engagement" stroke="#10b981" name="Engagement %" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Revenue by Show</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
          <Bar dataKey="orders" fill="#ec4899" name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function ProductPerformanceChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Product Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
