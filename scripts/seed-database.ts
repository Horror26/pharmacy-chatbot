import { MongoClient } from "mongodb"

// Replace this with your MongoDB URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://horror12:wk8g1ar2XHUS8VJQ@cluster0.gspfp6x.mongodb.net/pharma/inventories"

const medicines = [
  {
    name: "Paracetamol",
    category: "Pain Relief",
    purpose: "Fever and pain relief",
    price: 5.99,
    stock: 100,
    description: "Common pain reliever and fever reducer.",
    alternatives: ["Dolo", "Crocin", "Calpol"],
    activeIngredient: "Acetaminophen",
  },
  {
    name: "Dolo",
    category: "Pain Relief",
    purpose: "Fever and pain relief",
    price: 4.99,
    stock: 150,
    description: "Brand of paracetamol used for fever and pain relief.",
    alternatives: ["Paracetamol", "Crocin", "Calpol"],
    activeIngredient: "Acetaminophen",
  },
  {
    name: "Amoxicillin",
    category: "Antibiotics",
    purpose: "Bacterial infections",
    price: 12.5,
    stock: 50,
    description: "Antibiotic used to treat bacterial infections.",
    alternatives: ["Ampicillin", "Augmentin"],
    activeIngredient: "Amoxicillin",
  },
  {
    name: "Augmentin",
    category: "Antibiotics",
    purpose: "Bacterial infections",
    price: 18.75,
    stock: 30,
    description: "Combination antibiotic containing amoxicillin and clavulanic acid.",
    alternatives: ["Amoxicillin", "Ampicillin"],
    activeIngredient: "Amoxicillin + Clavulanic Acid",
  },
  {
    name: "Loratadine",
    category: "Allergy",
    purpose: "Allergy relief",
    price: 8.75,
    stock: 75,
    description: "Antihistamine for allergy relief.",
    alternatives: ["Cetirizine", "Fexofenadine"],
    activeIngredient: "Loratadine",
  },
  {
    name: "Cetirizine",
    category: "Allergy",
    purpose: "Allergy relief",
    price: 7.5,
    stock: 90,
    description: "Second-generation antihistamine used for allergy symptoms.",
    alternatives: ["Loratadine", "Fexofenadine"],
    activeIngredient: "Cetirizine",
  },
  {
    name: "Ibuprofen",
    category: "Pain Relief",
    purpose: "Pain and inflammation",
    price: 6.25,
    stock: 120,
    description: "Non-steroidal anti-inflammatory drug (NSAID) for pain and inflammation.",
    alternatives: ["Naproxen", "Diclofenac"],
    activeIngredient: "Ibuprofen",
  },
  {
    name: "Omeprazole",
    category: "Digestive Health",
    purpose: "Acid reflux and ulcers",
    price: 15.99,
    stock: 40,
    description: "Proton pump inhibitor that decreases stomach acid production.",
    alternatives: ["Pantoprazole", "Esomeprazole"],
    activeIngredient: "Omeprazole",
  },
  {
    name: "Pantoprazole",
    category: "Digestive Health",
    purpose: "Acid reflux and ulcers",
    price: 17.99,
    stock: 35,
    description: "Proton pump inhibitor for reducing stomach acid.",
    alternatives: ["Omeprazole", "Esomeprazole"],
    activeIngredient: "Pantoprazole",
  },
  {
    name: "Aspirin",
    category: "Pain Relief",
    purpose: "Pain relief and blood thinning",
    price: 4.5,
    stock: 0, // Out of stock
    description: "Pain reliever and blood thinner.",
    alternatives: ["Paracetamol", "Ibuprofen"],
    activeIngredient: "Acetylsalicylic Acid",
  },
]

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const database = client.db("healthcare")
    const medicinesCollection = database.collection("medicines")

    // Delete existing data
    await medicinesCollection.deleteMany({})
    console.log("Cleared existing medicines data")

    // Insert new data
    const result = await medicinesCollection.insertMany(medicines)
    console.log(`${result.insertedCount} medicines inserted successfully`)

    // Create indexes for better search performance
    await medicinesCollection.createIndex({ name: "text", category: "text", purpose: "text", activeIngredient: "text" })
    console.log("Created text search indexes")
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedDatabase().catch(console.error)

