"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, AlertCircle, Pill, Heart, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

type Medicine = {
  _id: string
  name: string
  category: string
  purpose: string
  price: number
  stock: number
  description: string
  activeIngredient: string
  alternatives?: string[]
}

export function MedicineDetail({
  medicine,
  onAddToCart,
  onSelectAlternative,
}: {
  medicine: Medicine
  onAddToCart: (medicine: Medicine) => void
  onSelectAlternative: (medicineName: string) => void
}) {
  const [alternatives, setAlternatives] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only fetch alternatives if the medicine is out of stock
    if (medicine && medicine.stock <= 0) {
      fetchAlternatives()
    } else {
      setAlternatives([])
    }
  }, [medicine])

  const fetchAlternatives = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/medicines/${encodeURIComponent(medicine.name)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch alternatives")
      }

      const data = await response.json()
      if (data.alternatives) {
        setAlternatives(data.alternatives)
      }
    } catch (error) {
      console.error("Error fetching alternatives:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!medicine) return null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{medicine.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-0">
                {medicine.category}
              </Badge>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${medicine.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {medicine.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹{medicine.price.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground"> 
              {medicine.stock > 0 ? `${medicine.stock} units available` : "Currently unavailable"}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Purpose</h3>
              <p className="text-gray-800">{medicine.purpose}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Ingredient</h3>
              <p className="text-gray-800">{medicine.activeIngredient}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-gray-800">{medicine.description}</p>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-green-100">Medical Information</h3>
                <p className="text-sm text-black mt-1">
                  This medication is used for {medicine.purpose.toLowerCase()}. Always follow the recommended dosage.
                </p>
              </div>
            </div>

            {medicine.stock > 0 ? (
              <Button
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                onClick={() => onAddToCart(medicine)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            ) : (
              <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Out of Stock</AlertTitle>
                <AlertDescription>
                  This medicine is currently unavailable. Please check the alternatives below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {medicine.stock <= 0 && alternatives.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Alternative Medicines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((alt) => (
              <Card
                key={alt._id}
                className="cursor-pointer hover:border-primary/50 transition-all duration-200"
                onClick={() => onSelectAlternative(alt.name)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-primary">{alt.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alt.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Active: {alt.activeIngredient}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-green-600">${alt.price.toFixed(2)}</span>
                      <Button variant="ghost" size="sm" className="mt-2 text-primary">
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

