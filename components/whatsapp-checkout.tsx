"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Check, Send, ShoppingBag } from "lucide-react"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export function WhatsAppCheckout({
  cartItems,
  totalPrice,
  onClose,
}: {
  cartItems: CartItem[]
  totalPrice: number
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create order message for WhatsApp
    const itemsList = cartItems
      .map((item) => `${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")

    const message = `
*New Order from HealthAssist*
---------------------------
*Customer*: ${name}
*Phone*: ${phone}
*Address*: ${address}

*Order Items*:
${itemsList}

*Total*: ₹${totalPrice.toFixed(2)}

*Notes*: ${notes || "None"}
---------------------------
    `.trim()

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message)

    // Show success state briefly before redirecting
    setIsSuccess(true)

    // Redirect to WhatsApp after a short delay
    setTimeout(() => {
      // Use the business phone number here (currently using a placeholder)
      window.open(`https://wa.me/919405576756?text=${encodedMessage}`, "_blank")
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md mx-auto health-card">
      <CardHeader className="space-y-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Complete Your Order
        </CardTitle>
        <CardDescription className="text-green-50">
          Your order will be sent via WhatsApp for confirmation
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your delivery address"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for your order"
              rows={2}
            />
          </div>

          <div className="bg-secondary/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Order Summary</h4>
            <ul className="space-y-1 text-sm">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting || isSuccess}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              disabled={isSubmitting || isSuccess}
            >
              {isSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Order Placed
                </>
              ) : isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Place Order
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

