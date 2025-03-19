"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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

type Recommendation = {
  name: string
  reason: string
}

export function MedicineSearch({ onSelect }: { onSelect: (medicine: Medicine) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setRecommendations([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setIsLoadingRecommendations(true)

    try {
      // Search for medicines
      const response = await fetch(`/api/medicines?query=${encodeURIComponent(searchTerm)}`)

      if (!response.ok) {
        throw new Error("Failed to search medicines")
      }

      const data = await response.json()
      const medicines = data.medicines || []
      setSearchResults(medicines)
      setHasSearched(true)

      // If we found exact matches, don't need recommendations
      if (medicines.some((med) => med.name.toLowerCase() === searchTerm.toLowerCase())) {
        setRecommendations([])
      } else {
        // Get AI recommendations
        try {
          const recResponse = await fetch("/api/medicine-recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: searchTerm,
              availableMedicines: medicines,
            }),
          })

          if (recResponse.ok) {
            const recData = await recResponse.json()
            setRecommendations(recData.recommendations || [])
          }
        } catch (error) {
          console.error("Error getting recommendations:", error)
          setRecommendations([])
        }
      }
    } catch (error) {
      console.error("Error searching medicines:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
      setIsLoadingRecommendations(false)
    }
  }

  const handleRecommendationSelect = async (recommendationName: string) => {
    try {
      const response = await fetch(`/api/medicines?query=${encodeURIComponent(recommendationName)}`)
      if (!response.ok) throw new Error("Failed to fetch medicine")

      const data = await response.json()
      if (data.medicines && data.medicines.length > 0) {
        // Find exact match or first result
        const medicine =
          data.medicines.find((med: Medicine) => med.name.toLowerCase() === recommendationName.toLowerCase()) ||
          data.medicines[0]

        onSelect(medicine)
      }
    } catch (error) {
      console.error("Error fetching recommended medicine:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for medicines..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {hasSearched && searchResults.length === 0 && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p>No medicines found matching (out of stock) "{searchTerm}"</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Search Results:</h3>
          <div className="divide-y rounded-md border">
            {searchResults.map((medicine) => (
              <div
                key={medicine._id}
                className="flex justify-between items-center p-3 hover:bg-muted cursor-pointer"
                onClick={() => onSelect(medicine)}
              >
                <div>
                  <p className="font-medium">{medicine.name}</p>
                  <p className="text-sm text-muted-foreground">{medicine.category}</p>
                  <p className="text-xs text-muted-foreground">{medicine.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${medicine.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    ${medicine.price.toFixed(2)}
                  </span>
                  <span className={`text-xs ${medicine.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {medicine.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => onSelect(medicine)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoadingRecommendations && (
        <div className="flex items-center justify-center p-4 text-white">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Getting recommendations...</span>
        </div>
      )}

      {!isLoadingRecommendations && recommendations.length > 0 && (
        <div className="space-y-2 mt-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium text-white">AI Recommendations:</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-green-200"
                onClick={() => handleRecommendationSelect(rec.name)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-primary">{rec.name}</p>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
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

