import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { query, availableMedicines } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Get available medicines from MongoDB if not provided
    let medicines = availableMedicines
    if (!medicines || !medicines.length) {
      const client = await clientPromise
      const db = client.db("healthcare")
      const medicinesCollection = db.collection("medicines")

      medicines = await medicinesCollection.find({ stock: { $gt: 0 } }).toArray()
    }

    // Format medicines for the prompt
    const medicinesList = medicines
      .map((med) => `${med.name} (${med.activeIngredient}): ${med.purpose}, Category: ${med.category}`)
      .join("\n")

    // Create prompt for medicine recommendations
    const prompt = `
      As a healthcare assistant, I need to recommend similar medicines to "${query}".
      
      Here are the available medicines in our inventory:
      ${medicinesList}
      
      Please recommend up to 3 medicines from our inventory that are most similar to "${query}" based on:
      1. Active ingredients
      2. Medical purpose/use
      3. Category
      
      For each recommendation, explain why it's similar to "${query}" and how it can be used.
      Format your response as a JSON array with objects containing:
      {
        "name": "Medicine Name",
        "reason": "Brief explanation of why this is recommended"
      }
      
      ONLY return the JSON array, nothing else.
    `

    // Generate response
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the JSON response
    try {
      const recommendations = JSON.parse(text)
      return NextResponse.json({ recommendations })
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return NextResponse.json(
        {
          error: "Failed to parse recommendations",
          rawResponse: text,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}

