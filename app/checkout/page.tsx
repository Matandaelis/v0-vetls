"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/contexts/cart-context"
import { useOrders } from "@/contexts/order-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartTotal, clearCart } = useCart()
  const { createOrder } = useOrders()
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping")
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    fullName: "",
    phone: "",
  })

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  const [paymentMethod, setPaymentMethod] = useState("card")

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Add items to your cart to proceed with checkout</p>
          <Link href="/">
            <Button size="lg">Back to Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const shipping = 10
  const total = subtotal + tax + shipping

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      customerInfo.email &&
      customerInfo.fullName &&
      customerInfo.phone &&
      shippingAddress.street &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zipCode
    ) {
      setStep("payment")
    }
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("review")
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const order = createOrder({
      items,
      subtotal,
      tax,
      shipping,
      total,
      customerInfo,
      shippingAddress,
      status: "processing",
    })

    clearCart()
    router.push(`/order-confirmation/${order.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/cart" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "shipping" || step === "payment" || step === "review" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                1
              </div>
              <div
                className={`h-1 flex-1 ${step === "payment" || step === "review" ? "bg-primary" : "bg-secondary"}`}
              />
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "payment" || step === "review" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                2
              </div>
              <div className={`h-1 flex-1 ${step === "review" ? "bg-primary" : "bg-secondary"}`} />
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${step === "review" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                3
              </div>
            </div>

            {/* Shipping Information */}
            {step === "shipping" && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        required
                        value={customerInfo.fullName}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="mb-4">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        required
                        value={shippingAddress.street}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            street: e.target.value,
                          })
                        }
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          required
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              city: e.target.value,
                            })
                          }
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          required
                          value={shippingAddress.state}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              state: e.target.value,
                            })
                          }
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            zipCode: e.target.value,
                          })
                        }
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-6">
                    Continue to Payment <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Card>
            )}

            {/* Payment Information */}
            {step === "payment" && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-3 mb-6">
                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="ml-3 font-semibold">Credit or Debit Card</span>
                    </label>
                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="ml-3 font-semibold">PayPal</span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input id="cardName" placeholder="John Doe" required />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiration Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 bg-transparent"
                      onClick={() => setStep("shipping")}
                    >
                      Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1">
                      Review Order <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Order Review */}
            {step === "review" && (
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping To</h3>
                    <p className="text-muted-foreground">
                      {customerInfo.fullName}
                      <br />
                      {shippingAddress.street}
                      <br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <p className="text-muted-foreground">
                      {paymentMethod === "card" ? "Credit or Debit Card" : "PayPal"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-transparent"
                    onClick={() => setStep("payment")}
                  >
                    Back
                  </Button>
                  <Button size="lg" className="flex-1" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6 pb-6 border-b border-border">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
