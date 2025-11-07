"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useOrders } from "@/contexts/order-context"
import { useParams } from "next/navigation"
import { Check, Truck, Package, Home, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function OrderConfirmationPage() {
  const params = useParams()
  const { getOrderById } = useOrders()
  const order = getOrderById(params.id as string)

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Order not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusIndex = () => {
    const statuses = ["pending", "processing", "shipped", "delivered"]
    return statuses.indexOf(order.status)
  }

  const statusIndex = getStatusIndex()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your purchase. Your order has been received.
          </p>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to {order.customerInfo.email}
          </p>
        </div>

        {/* Order Number & Date */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-xl font-bold">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="text-xl font-bold">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Tracking Status */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Delivery Status</h2>
          <div className="flex items-center justify-between">
            {[
              { label: "Pending", icon: Package },
              { label: "Processing", icon: Package },
              { label: "Shipped", icon: Truck },
              { label: "Delivered", icon: Home },
            ].map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index <= statusIndex
              const isActive = index === statusIndex

              return (
                <div key={step.label} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? "bg-green-100 text-green-600" : "bg-secondary text-muted-foreground"
                    } ${isActive ? "ring-2 ring-primary" : ""}`}
                  >
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <p
                    className={`text-xs font-semibold text-center ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </p>
                  {index < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 -mt-8 ${isCompleted && index < statusIndex ? "bg-green-100" : "bg-secondary"}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Your order is {order.status}. We'll notify you when it ships!
          </p>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Shipping Address</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground">{order.customerInfo.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">{order.customerInfo.phone}</p>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">Items ({order.items.length})</h3>
            <div className="space-y-3 text-sm">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download Invoice
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            Share Order
          </Button>
        </div>

        {/* Back to Shopping */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Continue exploring and find more amazing products!</p>
          <Link href="/">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
