"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, Activity, Loader2, Pill, Heart, Clock, Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// Symptom categories and their symptoms
const SYMPTOM_CATEGORIES = {
  "General": [
    { id: "fever", label: "Fever" },
    { id: "fatigue", label: "Fatigue" },
    { id: "weakness", label: "General Weakness" },
    { id: "body-aches", label: "Body Aches" },
    { id: "chills", label: "Chills" },
    { id: "sweating", label: "Night Sweating" },
  ],
  "Head & Neck": [
    { id: "headache", label: "Headache" },
    { id: "sore-throat", label: "Sore Throat" },
    { id: "neck-pain", label: "Neck Pain" },
    { id: "dizziness", label: "Dizziness" },
    { id: "vision-changes", label: "Vision Changes" },
  ],
  "Respiratory": [
    { id: "cough", label: "Cough" },
    { id: "shortness-of-breath", label: "Shortness of Breath" },
    { id: "runny-nose", label: "Runny Nose" },
    { id: "congestion", label: "Nasal Congestion" },
    { id: "chest-pain", label: "Chest Pain" },
  ],
  "Digestive": [
    { id: "nausea", label: "Nausea" },
    { id: "vomiting", label: "Vomiting" },
    { id: "diarrhea", label: "Diarrhea" },
    { id: "stomach-pain", label: "Stomach Pain" },
    { id: "loss-of-appetite", label: "Loss of Appetite" },
  ],
}

export function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const filteredCategories = Object.entries(SYMPTOM_CATEGORIES).reduce((acc, [category, symptoms]) => {
    const filteredSymptoms = symptoms.filter((symptom) =>
      symptom.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filteredSymptoms.length > 0) {
      acc[category] = filteredSymptoms
    }
    return acc
  }, {} as Record<string, typeof SYMPTOM_CATEGORIES[keyof typeof SYMPTOM_CATEGORIES]>)

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setResult("Please select at least one symptom.")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze symptoms")
      }

      const data = await response.json()
      setResult(data.analysis)
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      setResult("An error occurred while analyzing your symptoms. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatAnalysisResult = () => {
    if (!result) return null

    const sections: Record<string, string> = {}
    const analysisMatch = result.match(/ANALYSIS:([^]*?)(?=SELF-CARE:|$)/)
    const selfCareMatch = result.match(/SELF-CARE:([^]*?)(?=WHEN TO SEE A DOCTOR:|$)/)
    const doctorMatch = result.match(/WHEN TO SEE A DOCTOR:([^]*?)(?=RECOMMENDED MEDICINES:|$)/)
    const medicinesMatch = result.match(/RECOMMENDED MEDICINES:([^]*?)$/)

    if (analysisMatch && analysisMatch[1]) sections.analysis = analysisMatch[1].trim()
    if (selfCareMatch && selfCareMatch[1]) sections.selfCare = selfCareMatch[1].trim()
    if (doctorMatch && doctorMatch[1]) sections.doctor = doctorMatch[1].trim()
    if (medicinesMatch && medicinesMatch[1]) sections.medicines = medicinesMatch[1].trim()

    if (Object.keys(sections).length === 0) {
      return (
        <div className="space-y-2">
          {result.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )
    }

    const medicines = sections.medicines
      ? sections.medicines
          .split("-")
          .filter((item) => {
            const trimmed = item.trim()
            // Filter out items that don't look like medicine entries
            return trimmed.length > 0 && trimmed.includes(":") && !trimmed.match(/^(the|and|or|with)$/i)
          })
          .map((item) => {
            const [name, ...descParts] = item.split(":")
            return {
              name: name?.trim(),
              description: descParts.join(":").trim(),
            }
          })
      : []

    return (
      <div className="space-y-6">
        {sections.analysis && (
          <Card className="bg-white/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-primary">
                <AlertCircle className="h-4 w-4" /> Analysis
              </h3>
              <p className="text-sm text-black">{sections.analysis}</p>
            </CardContent>
          </Card>
        )}

        {sections.selfCare && (
          <Card className="bg-white/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-primary">
                <Heart className="h-4 w-4" /> Self-Care Recommendations
              </h3>
              <p className="text-sm text-black">{sections.selfCare}</p>
            </CardContent>
          </Card>
        )}

        {sections.doctor && (
          <Card className="bg-white/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" /> When to See a Doctor
              </h3>
              <p className="text-sm text-black">{sections.doctor}</p>
            </CardContent>
          </Card>
        )}

        {medicines.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <Pill className="h-4 w-4" /> Recommended Medicines
            </h3>
            <div className="grid gap-3">
              {medicines.map((medicine, index) => (
                <Card key={index} className="bg-secondary/20 border-secondary/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-primary text-lg">{medicine.name}</h4>
                    <div className="mt-2 space-y-3 text-black">
                      {medicine.description.split('.').map((sentence, i) => {
                        const trimmed = sentence.trim()
                        if (!trimmed) return null

                        // For the purpose/use case
                        if (trimmed.toLowerCase().includes('for ') && !trimmed.toLowerCase().includes('recommended')) {
                          return (
                            <p key={i} className="text-sm font-medium text-emerald-600">
                              {trimmed}
                            </p>
                          )
                        }
                        
                        // For recommended usage and dosage
                        if (trimmed.toLowerCase().includes('recommended usage:') || 
                            (trimmed.toLowerCase().includes('tablet') && trimmed.toLowerCase().includes('every'))) {
                          return (
                            <div key={i} className="mt-2">
                              <p className="font-medium mb-2">How to Take:</p>
                              <div className="bg-white/50 rounded-md p-3 text-sm">
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 mt-0.5 text-primary" />
                                  <p>{trimmed.replace('Recommended usage:', '').trim()}</p>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // For tablet/dose information
                        if (trimmed.toLowerCase().includes('each tablet contains')) {
                          return (
                            <div key={i} className="mt-2 bg-white/50 rounded-md p-3">
                              <p className="text-sm">
                                <span className="font-medium">Strength: </span>
                                {trimmed}
                              </p>
                            </div>
                          )
                        }
                        
                        // For maximum daily limit
                        if (trimmed.toLowerCase().includes('maximum daily limit') || 
                            trimmed.toLowerCase().includes('mg in 24 hours')) {
                          return (
                            <div key={i} className="mt-2 bg-amber-50/50 rounded-md p-3">
                              <p className="text-sm font-medium text-amber-800">
                                Maximum Daily Limit: 
                                <span className="font-normal ml-1">
                                  {trimmed.includes(':') ? trimmed.split(':')[1].trim() : trimmed}
                                </span>
                              </p>
                            </div>
                          )
                        }

                        // For special instructions or warnings
                        if (trimmed.toLowerCase().includes('take with') || 
                            trimmed.toLowerCase().includes('wait') ||
                            trimmed.toLowerCase().includes('warning') ||
                            trimmed.toLowerCase().includes('do not')) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm mt-2">
                              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                              <p>{trimmed}</p>
                            </div>
                          )
                        }
                        
                        // For hours as needed part
                        if (trimmed.toLowerCase().includes('hours as needed')) {
                          return (
                            <div key={i} className="text-sm text-gray-600 mt-1">
                              {trimmed}
                            </div>
                          )
                        }
                        
                        return trimmed ? <p key={i} className="text-sm">{trimmed}</p> : null
                      })}
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

  return (
    <Card className="w-full max-w-4xl mx-auto health-card">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg space-y-3">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-6 w-6" />
          Symptom Checker
        </CardTitle>
        <CardDescription className="text-white/90">
          Select your symptoms for a preliminary analysis and personalized recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(([category, symptoms]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium text-lg text-primary flex items-center gap-2">
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {symptoms.length}
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className={`
                        flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all
                        ${
                          selectedSymptoms.includes(symptom.id)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                      onClick={() => handleSymptomToggle(symptom.id)}
                    >
                      <Checkbox
                        id={symptom.id}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => handleSymptomToggle(symptom.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label
                        htmlFor={symptom.id}
                        className={`cursor-pointer text-black ${
                          selectedSymptoms.includes(symptom.id) ? "font-medium" : ""
                        }`}
                      >
                        {symptom.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {selectedSymptoms.length > 0 && (
          <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Selected Symptoms:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptomId) => {
                const symptom = Object.values(SYMPTOM_CATEGORIES)
                  .flat()
                  .find((s) => s.id === symptomId)
                return (
                  <Badge
                    key={symptomId}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleSymptomToggle(symptomId)}
                  >
                    {symptom?.label} ×
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            {formatAnalysisResult()}

            <Separator className="my-6" />

            <Card className="bg-amber-50 border-amber-100">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    This is not a medical diagnosis. The recommendations provided are for informational purposes only.
                    Please consult a healthcare professional for proper medical advice and treatment.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-6">
        <Button
          onClick={analyzeSymptoms}
          disabled={isLoading || selectedSymptoms.length === 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 h-11 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Symptoms...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-5 w-5" /> Analyze {selectedSymptoms.length} Symptom{selectedSymptoms.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

