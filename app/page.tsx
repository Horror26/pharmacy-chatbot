"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicineSearch } from "@/components/medicine-search"
import { MedicineDetail } from "@/components/medicine-detail"
import { SymptomChecker } from "@/components/symptom-checker"
import { Bot, User, Heart, Pill, Search, Activity, ShoppingBag, Send } from "lucide-react"
import { ShoppingCartComponent } from "@/components/shopping-cart"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleMedicineSelect = (medicine: any) => {
    setSelectedMedicine(medicine)
    setActiveTab("buy")
  }

  const handleAddToCart = (medicine: any) => {
    // Get current cart
    const savedCart = localStorage.getItem("medicineCart")
    const cart = savedCart ? JSON.parse(savedCart) : []

    // Check if item already exists
    const existingItem = cart.find((item: any) => item.id === medicine._id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: medicine._id,
        name: medicine.name,
        price: medicine.price,
        quantity: 1,
      })
    }

    // Save updated cart
    localStorage.setItem("medicineCart", JSON.stringify(cart))

    // Dispatch custom event to notify cart component
    window.dispatchEvent(new Event("cartUpdated"))

    alert(`${medicine.name} added to cart!`)
  }

  const handleSelectAlternative = async (medicineName: string) => {
    try {
      const response = await fetch(`/api/medicines?query=${encodeURIComponent(medicineName)}`)
      if (!response.ok) throw new Error("Failed to fetch medicine")

      const data = await response.json()
      if (data.medicines && data.medicines.length > 0) {
        setSelectedMedicine(data.medicines[0])
      }
    } catch (error) {
      console.error("Error fetching alternative medicine:", error)
    }
  }

  // Handle chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])

    // Clear input and set loading
    setInput("")
    setIsLoading(true)

    try {
      // Send request to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content || "I'm sorry, I couldn't process your request.",
        },
      ])
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent
      handleSubmit(fakeEvent)
    }, 100)
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">HealthAssist</CardTitle>
            <ShoppingCartComponent />
          </div>
          <CardDescription className="text-white/90">
            Your AI Healthcare Assistant
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 p-1 bg-emerald-50">
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-emerald-700"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-emerald-700"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Medicines</span>
            </TabsTrigger>
            <TabsTrigger 
              value="symptoms" 
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-emerald-700"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="buy" 
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:text-emerald-600 text-emerald-700"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Buy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="p-0">
            <CardContent className="h-[60vh] overflow-y-auto p-4 space-y-4 health-pattern">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Bot className="h-16 w-16 text-primary/30 mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">Welcome to HealthAssist!</h3>
                  <p className="max-w-md">
                    Ask me about common health conditions, medicines, or general health advice. I'm here to help!
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    <Button
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => handleQuickPrompt("Tell me about paracetamol")}
                    >
                      <Pill className="mr-2 h-4 w-4 text-primary" />
                      About Paracetamol
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => handleQuickPrompt("What should I do for a headache?")}
                    >
                      <Activity className="mr-2 h-4 w-4 text-primary" />
                      Help with headache
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => handleQuickPrompt("Tell me about ibuprofen")}
                    >
                      <Pill className="mr-2 h-4 w-4 text-primary" />
                      About Ibuprofen
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => handleQuickPrompt("What should I do for a fever?")}
                    >
                      <Activity className="mr-2 h-4 w-4 text-primary" />
                      Help with fever
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white shadow-sm border border-green-100"
                      }`}
                    >
                      {message.role === "user" ? <User size={16} /> : <Bot size={16} className="text-primary" />}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white shadow-sm border border-green-100 text-black"
                      }`}
                    >
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="rounded-full p-2 bg-white shadow-sm border border-green-100">
                      <Bot size={16} className="text-primary" />
                    </div>
                    <div className="rounded-lg p-3 bg-white shadow-sm border border-green-100">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about health conditions or medicines..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent value="search">
            <CardContent className="p-4">
              <MedicineSearch onSelect={handleMedicineSelect} />
            </CardContent>
          </TabsContent>

          <TabsContent value="symptoms">
            <CardContent className="p-4">
              <SymptomChecker />
            </CardContent>
          </TabsContent>

          <TabsContent value="buy">
            <CardContent className="p-4">
              {selectedMedicine ? (
                <MedicineDetail
                  medicine={selectedMedicine}
                  onAddToCart={handleAddToCart}
                  onSelectAlternative={handleSelectAlternative}
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Pill className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                  <p>Select a medicine from the search tab to view buying options.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab("search")}>
                    <Search className="mr-2 h-4 w-4" />
                    Search Medicines
                  </Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  )
}

