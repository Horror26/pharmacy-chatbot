import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const medicineName = params.name

    const client = await clientPromise
    const db = client.db("healthcare")
    const medicinesCollection = db.collection("medicines")

    // Find the requested medicine
    const medicine = await medicinesCollection.findOne({
      name: { $regex: new RegExp(`^${medicineName}$`, "i") },
    })

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // If medicine is out of stock, find alternatives
    let alternatives = []
    if (medicine.stock <= 0 && medicine.alternatives && medicine.alternatives.length > 0) {
      alternatives = await medicinesCollection
        .find({
          name: { $in: medicine.alternatives },
          stock: { $gt: 0 },
        })
        .toArray()
    }

    return NextResponse.json({
      medicine,
      alternatives: alternatives.length > 0 ? alternatives : null,
    })
  } catch (error) {
    console.error("Error fetching medicine details:", error)
    return NextResponse.json({ error: "Failed to fetch medicine details" }, { status: 500 })
  }
}

