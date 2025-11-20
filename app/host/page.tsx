"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HostOverviewStats } from "@/components/host/overview-stats"
import { StreamControlPanel } from "@/components/host/stream-control-panel"
import { ActiveStreams } from "@/components/host/active-streams"
import { LiveChatModeration } from "@/components/host/live-chat-moderation"
import { ProductManagement } from "@/components/host/product-management"
import { HostAnalytics } from "@/components/host/host-analytics"
import { Plus, BarChart3, MessageSquare, ShoppingCart, Radio } from "lucide-react"

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="w-full">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Host Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your live shows, products, and analytics</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Show
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="streams" className="gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Streams</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StreamControlPanel />
              </div>
              <div>
                <Card className="p-6 h-full">
                  <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      New Show
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Radio className="w-4 h-4 mr-2" />
                      Go Live
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add Products
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
            <HostOverviewStats />
          </TabsContent>

          <TabsContent value="streams" className="space-y-6">
            <ActiveStreams />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <LiveChatModeration />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <HostAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
