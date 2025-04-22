"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react"
import { WhatsAppCheckout } from "./whatsapp-checkout"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  purpose: string
  activeIngredient: string
  manufacturer: string
  expiryDate: Date
  batchNumber: string
}

export function ShoppingCartComponent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Load cart from localStorage on component mount and when localStorage changes
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("medicineCart")
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error parsing cart data:", error)
          setCartItems([])
        }
      }
    }

    // Load cart initially
    loadCart()

    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "medicineCart") {
        loadCart()
      }
    }

    // Custom event for cart updates within the same window
    const handleCartUpdate = () => loadCart()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("medicineCart", JSON.stringify(cartItems))
  }, [cartItems])

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }

  const handleCheckout = () => {
    setIsOpen(false)
    setIsCheckoutOpen(true)
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      <div className="relative">
        <Button variant="outline" className="relative bg-white/80 hover:bg-white" onClick={() => setIsOpen(!isOpen)}>
          <ShoppingCart className="h-5 w-5 text-primary" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>

        {isOpen && (
          <Card className="absolute right-0 mt-2 w-80 z-50 shadow-lg bg-white">
            <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Your Cart</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex flex-col border-b pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="font-medium text-primary">₹{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-black text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t pt-4 bg-gray-50">
              <div className="flex justify-between w-full">
                <span className="font-medium text-gray-800">Total:</span>
                <span className="font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 font-medium"
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
              >
                Checkout via WhatsApp
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <WhatsAppCheckout cartItems={cartItems} totalPrice={totalPrice} onClose={() => setIsCheckoutOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

