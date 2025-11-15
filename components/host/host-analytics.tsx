"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const viewerData = [
  { time: "12am", viewers: 450 },
  { time: "3am", viewers: 380 },
  { time: "6am", viewers: 520 },
  { time: "9am", viewers: 890 },
  { time: "12pm", viewers: 1240 },
  { time: "3pm", viewers: 1850 },
  { time: "6pm", viewers: 2340 },
]

const revenueData = [
  { day: "Mon", revenue: 1200 },
  { day: "Tue", revenue: 1400 },
  { day: "Wed", revenue: 1100 },
  { day: "Thu", revenue: 1600 },
  { day: "Fri", revenue: 1800 },
  { day: "Sat", revenue: 2200 },
  { day: "Sun", revenue: 1900 },
]

export function HostAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Viewer Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={viewerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="viewers" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Weekly Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h3 className="font-bold text-lg mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Avg Session", value: "23m 14s" },
            { label: "Engagement", value: "87%" },
            { label: "Repeat Viewers", value: "64%" },
            { label: "Avg Order Value", value: "$145" },
          ].map((metric) => (
            <div key={metric.label} className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
              <p className="text-lg font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
