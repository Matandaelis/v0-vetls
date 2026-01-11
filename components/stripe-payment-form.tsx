"use client"

import type React from "react"

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface StripePaymentFormProps {
  amount: number
  orderId: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export function StripePaymentForm({ amount, orderId, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState("")
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      onError("Stripe not loaded")
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent on backend
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          orderId,
          customerId: email,
        }),
      })

      if (!response.ok) throw new Error("Failed to create payment intent")

      const { clientSecret, paymentIntentId } = await response.json()

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error("Card element not found")

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
          },
        },
      })

      if (result.error) {
        onError(result.error.message || "Payment failed")
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntentId)
      }
    } catch (error: any) {
      onError(error.message || "Payment processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setBillingDetails({ ...billingDetails, email: e.target.value })
            }}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label>Card Information</Label>
          <div className="border border-input rounded-md p-3 bg-background">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": { color: "#aab7c4" },
                  },
                  invalid: { color: "#9e2146" },
                },
              }}
            />
          </div>
        </div>

        <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
          {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </form>
    </Card>
  )
}
