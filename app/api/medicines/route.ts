import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const searchQuery = url.searchParams.get("query")?.toLowerCase() || ""

    const client = await clientPromise
    const db = client.db("pharma")
    const medicinesCollection = db.collection("inventories")

    let medicines

    if (searchQuery) {
      // Use text search if query is provided
      medicines = await medicinesCollection
        .find({
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
            { purpose: { $regex: searchQuery, $options: "i" } },
            { activeIngredient: { $regex: searchQuery, $options: "i" } },
          ],
        })
        .toArray()
    } else {
      // Return all medicines if no query
      medicines = await medicinesCollection.find({}).limit(10).toArray()
    }

    return NextResponse.json({ medicines })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 })
  }
}

