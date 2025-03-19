import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Allow responses up to 30 seconds
export const maxDuration = 30

const MEDICAL_DISCLAIMER = "\n\n⚕️ Note: I am an AI assistant. Please consult a healthcare professional for medical advice."

type Message = {
  content: string;
  role: 'user' | 'assistant';
}

const PHARMACY_PROMPT = `You are a helpful pharmacy assistant. Your role is to:
1. Answer questions about common medications and their general uses
2. Provide basic health information and self-care tips
3. Always emphasize the importance of consulting healthcare professionals
4. Never prescribe medications or give specific medical advice
5. Keep responses clear, friendly, and informative

Remember to:
- Be helpful but cautious with health-related information
- Encourage consulting pharmacists or doctors for specific concerns
- Focus on general wellness and basic health information
- Maintain a professional and supportive tone`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const userMessage = messages[messages.length - 1].content

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    
    // If this is the first message, send welcome message
    if (messages.length === 1) {
      return NextResponse.json({
        content: `Hi! I'm your pharmacy assistant. I can help answer questions about medications and provide general health information.${MEDICAL_DISCLAIMER}`
      })
    }

    // Create conversation prompt
    const prompt = `${PHARMACY_PROMPT}\n\nUser question: ${userMessage}\n\nProvide a helpful response:`

    // Generate response using Gemini
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    return NextResponse.json({
      content: `${response}${MEDICAL_DISCLAIMER}`
    })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { content: "I'm sorry, I couldn't understand that. Could you rephrase your question?" },
      { status: 500 }
    )
  }
}

