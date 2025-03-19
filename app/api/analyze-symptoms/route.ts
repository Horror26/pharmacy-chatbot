import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    const { symptoms } = await req.json()

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: "Invalid symptoms data" }, { status: 400 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Get available medicines from MongoDB
    const client = await clientPromise
    const db = client.db("healthcare")
    const medicinesCollection = db.collection("medicines")

    const availableMedicines = await medicinesCollection.find({ stock: { $gt: 0 } }).toArray()

    // Format medicines for the prompt
    const medicinesList = availableMedicines
      .map((med) => `${med.name} (${med.activeIngredient}): ${med.purpose}, Category: ${med.category}`)
      .join("\n")

    // Create prompt for symptom analysis with medicine recommendations
    const prompt = `
      As a healthcare assistant, I need to provide a preliminary analysis of the following symptoms:
      ${symptoms.join(", ")}
      
      Here are the available medicines in our inventory:
      ${medicinesList}
      
      Please provide:
      1. Possible common conditions associated with these symptoms
      2. General self-care recommendations
      3. When the person should consider seeing a doctor
      4. Recommended over-the-counter medicines from our inventory with clear, practical dosage information
      
      Format your response EXACTLY as follows:
      
      ANALYSIS: [Brief analysis of the symptoms]
      
      SELF-CARE: [Self-care recommendations]
      
      WHEN TO SEE A DOCTOR: [When to seek professional medical help]
      
      RECOMMENDED MEDICINES:
      - [Medicine Name]: [Brief description of what it treats]. Recommended usage: [Number of tablets/amount] [When to take (e.g., after breakfast and dinner)]. Each tablet contains [amount]mg. Maximum daily limit: [amount]mg in 24 hours. [Any special instructions or warnings].
      
      For example format:
      - Paracetamol (Acetaminophen): For fever and pain relief. Recommended usage: 1 tablet (500mg) after breakfast and 1 tablet after dinner. Each tablet contains 500mg. Maximum daily limit: 4000mg in 24 hours. Take with food. Wait at least 4 hours between doses.
      
      IMPORTANT: Make it clear this is NOT a diagnosis. Keep the response concise but include practical timing for medicine intake (e.g., after meals, before bed). Only recommend medicines that are appropriate for the symptoms and include clear dosage timing. Do not add any text outside of these sections.
    `

    // Generate response
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing symptoms:", error)
    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}

