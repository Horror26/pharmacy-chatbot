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
  manufacturer: string
  expiryDate: Date
  batchNumber: string
  alternatives: string[]
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

      // Get all medicines to check alternatives
      const allMedicinesResponse = await fetch('/api/medicines')
      const allMedicinesData = await allMedicinesResponse.json()
      const allMedicines = allMedicinesData.medicines || []

      // If we found medicines in stock, no need for recommendations
      if (medicines.some((med: Medicine) => med.stock > 0)) {
        setRecommendations([])
      } else {
        // Check if the search term matches any medicine's alternatives
        const medicinesWithThisAlternative = allMedicines.filter((med: Medicine) => 
          med.alternatives?.some((alt: string) => 
            alt.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

        if (medicinesWithThisAlternative.length > 0) {
          // If the search term is an alternative, recommend the main medicines that are in stock
          const recommendations = medicinesWithThisAlternative
            .filter((med: Medicine) => med.stock > 0)
            .map((med: Medicine) => ({
              name: med.name,
              reason: `This medicine is available as an alternative to ${searchTerm}`
            }));
          setRecommendations(recommendations);
        } else {
          // If medicines are found but out of stock, show their alternatives that are in stock
          const alternativesRecommendations = medicines.flatMap((medicine: Medicine) => {
            // Find medicines that are listed as alternatives and are in stock
            const inStockAlternatives = allMedicines.filter((med: Medicine) => 
              medicine.alternatives?.includes(med.name) && med.stock > 0
            );
            
            return inStockAlternatives.map((alt: Medicine) => ({
              name: alt.name,
              reason: `In stock alternative for ${medicine.name}`
            }));
          });
          
          setRecommendations(alternativesRecommendations);
        }
      }
    } catch (error) {
      console.error("Error searching medicines:", error)
      setSearchResults([])
      setRecommendations([])
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
                className="flex flex-col p-4 hover:bg-muted cursor-pointer border-b last:border-b-0"
                onClick={() => onSelect(medicine)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-lg">{medicine.name}</p>
                    <p className="text-sm text-muted-foreground">{medicine.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium text-lg ${medicine.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      ₹{medicine.price.toFixed(2)}
                    </span>
                    <div className={`text-sm ${medicine.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {medicine.stock > 0 ? `${medicine.stock} in Stock` : "Out of Stock"}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Manufacturer:</span> {medicine.manufacturer}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Ingredient:</span> {medicine.activeIngredient}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Batch:</span> {medicine.batchNumber}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>{" "}
                    {new Date(medicine.expiryDate).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-sm mt-2">{medicine.purpose}</p>
                
                {medicine.alternatives && medicine.alternatives.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Alternatives:</span>{" "}
                    {medicine.alternatives.join(", ")}
                  </div>
                )}
                
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onSelect(medicine);
                  }}>
                    View Details
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

