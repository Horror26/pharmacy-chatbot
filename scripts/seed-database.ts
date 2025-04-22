const { MongoClient } = require("mongodb")

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://horror12:wk8g1ar2XHUS8VJQ@cluster0.gspfp6x.mongodb.net/pharma/inventories"

const medicines = [
  {
    name: "Amoxicillin 500mg Capsule",
    category: "Antibiotics",
    purpose: "Used to treat various bacterial infections including respiratory tract, urinary tract, and skin infections.",
    price: 42.75,
    stock: 120,
    description: "Broad-spectrum antibiotic commonly prescribed in India.",
    activeIngredient: "Amoxicillin Trihydrate",
    manufacturer: "Cipla Ltd",
    expiryDate: new Date("2026-09-30"),
    batchNumber: "AMX500CIP0925",
    alternatives: ["Azithromycin", "Cefixime", "Cephalexin"]
  },
  {
    name: "Paracetamol 650mg Tablet",
    category: "Analgesics",
    purpose: "Fever and pain relief, including headaches and muscle pain.",
    price: 18.5,
    stock: 200,
    description: "Popular painkiller in India available over-the-counter.",
    activeIngredient: "Paracetamol",
    manufacturer: "Sun Pharmaceutical",
    expiryDate: new Date("2026-03-31"),
    batchNumber: "PCM650SUN0325",
    alternatives: ["Dolo 650", "Crocin", "Calpol"]
  },
  {
    name: "Cetirizine 10mg Tablet",
    category: "Antihistamines",
    purpose: "Relief from allergic symptoms such as sneezing and runny nose.",
    price: 12.0,
    stock: 150,
    description: "Non-drowsy antihistamine for seasonal allergies.",
    activeIngredient: "Cetirizine Hydrochloride",
    manufacturer: "Alkem Laboratories",
    expiryDate: new Date("2025-12-31"),
    batchNumber: "CET10ALK1224",
    alternatives: ["Loratadine", "Levocetirizine"]
  },
  {
    name: "Metformin 500mg Tablet",
    category: "Antidiabetics",
    purpose: "Used to manage blood sugar levels in type 2 diabetes.",
    price: 27.0,
    stock: 100,
    description: "First-line treatment for type 2 diabetes in India.",
    activeIngredient: "Metformin Hydrochloride",
    manufacturer: "Dr. Reddy's Laboratories",
    expiryDate: new Date("2027-01-31"),
    batchNumber: "MET500DRL0125",
    alternatives: ["Glimepiride", "Vildagliptin"]
  },
  {
    name: "Pantoprazole 40mg Tablet",
    category: "Antacids",
    purpose: "Used for acid reflux, gastritis, and peptic ulcers.",
    price: 35.0,
    stock: 85,
    description: "Reduces stomach acid by blocking proton pumps.",
    activeIngredient: "Pantoprazole Sodium",
    manufacturer: "Zydus Cadila",
    expiryDate: new Date("2026-06-30"),
    batchNumber: "PAN40ZYD0625",
    alternatives: ["Omeprazole", "Esomeprazole"]
  },
  {
    name: "Amlodipine 5mg Tablet",
    category: "Antihypertensives",
    purpose: "Used to treat high blood pressure and angina.",
    price: 22.5,
    stock: 130,
    description: "Calcium channel blocker widely used in hypertension management.",
    activeIngredient: "Amlodipine Besylate",
    manufacturer: "Torrent Pharmaceuticals",
    expiryDate: new Date("2026-11-30"),
    batchNumber: "AML5TOR1125",
    alternatives: ["Nifedipine", "Felodipine", "Lercanidipine"]
  },
  {
    name: "Atorvastatin 10mg Tablet",
    category: "Lipid-lowering agents",
    purpose: "Used to lower cholesterol and reduce risk of heart disease.",
    price: 30.0,
    stock: 90,
    description: "Statin commonly used in India to manage cholesterol levels.",
    activeIngredient: "Atorvastatin Calcium",
    manufacturer: "Cipla Ltd",
    expiryDate: new Date("2027-04-30"),
    batchNumber: "ATV10CIP0426",
    alternatives: ["Rosuvastatin", "Simvastatin"]
  },
  {
    name: "Levothyroxine 50mcg Tablet",
    category: "Thyroid Hormones",
    purpose: "Treatment of hypothyroidism (underactive thyroid).",
    price: 15.0,
    stock: 140,
    description: "Synthetic thyroid hormone replacement therapy.",
    activeIngredient: "Levothyroxine Sodium",
    manufacturer: "Abbott Healthcare",
    expiryDate: new Date("2027-02-28"),
    batchNumber: "LEV50ABB0226",
    alternatives: ["Eltroxin", "Thyronorm"]
  },
  {
    name: "Domperidone 10mg Tablet",
    category: "Antiemetics",
    purpose: "Used to relieve nausea and vomiting, also improves gut motility.",
    price: 19.0,
    stock: 75,
    description: "Often prescribed alongside acid reducers in GI disorders.",
    activeIngredient: "Domperidone",
    manufacturer: "Sun Pharmaceutical",
    expiryDate: new Date("2026-07-31"),
    batchNumber: "DOM10SUN0725",
    alternatives: ["Ondansetron", "Metoclopramide"]
  },
  {
    name: "Ibuprofen 400mg Tablet",
    category: "NSAIDs",
    purpose: "Pain relief for conditions like arthritis, menstrual cramps, and minor injuries.",
    price: 16.5,
    stock: 110,
    description: "Non-steroidal anti-inflammatory drug (NSAID).",
    activeIngredient: "Ibuprofen",
    manufacturer: "Dr. Reddy's Laboratories",
    expiryDate: new Date("2025-10-31"),
    batchNumber: "IBU400DRL1024",
    alternatives: ["Naproxen", "Diclofenac", "Ketoprofen"]
  }
  ,{
    name: "Metformin 500mg Tablet",
    category: "Anti-diabetic",
    purpose: "First-line medication for type 2 diabetes management.",
    price: 12.0,
    stock: 200,
    description: "Helps control blood sugar levels and improve insulin sensitivity.",
    activeIngredient: "Metformin Hydrochloride",
    manufacturer: "USV Private Limited",
    expiryDate: new Date("2026-09-30"),
    batchNumber: "MET500USV0925",
    alternatives: ["Glucophage", "Glycomet"]
  },
  {
    name: "Amlodipine 5mg Tablet",
    category: "Anti-hypertensive",
    purpose: "Treatment of high blood pressure and angina.",
    price: 22.5,
    stock: 160,
    description: "Calcium channel blocker that relaxes blood vessels.",
    activeIngredient: "Amlodipine Besylate",
    manufacturer: "Zydus Healthcare",
    expiryDate: new Date("2026-11-30"),
    batchNumber: "AML5ZYD1125",
    alternatives: ["Norvasc", "Amlogard"]
  },
  {
    name: "Cetirizine 10mg Tablet",
    category: "Antihistamines",
    purpose: "Relief from allergies and hay fever symptoms.",
    price: 8.5,
    stock: 180,
    description: "Second-generation antihistamine with minimal sedating effects.",
    activeIngredient: "Cetirizine Hydrochloride",
    manufacturer: "Mankind Pharma",
    expiryDate: new Date("2026-08-31"),
    batchNumber: "CET10MAN0825",
    alternatives: ["Zyrtec", "Alerid"]
  },
  {
    name: "Pantoprazole 40mg Tablet",
    category: "Proton Pump Inhibitors",
    purpose: "Treatment of acid reflux and stomach ulcers.",
    price: 25.0,
    stock: 120,
    description: "Reduces stomach acid production for gastric conditions.",
    activeIngredient: "Pantoprazole Sodium",
    manufacturer: "Alkem Laboratories",
    expiryDate: new Date("2026-12-31"),
    batchNumber: "PAN40ALK1225",
    alternatives: ["Omeprazole", "Rabeprazole"]
  },
  {
    name: "Sertraline 50mg Tablet",
    category: "Antidepressants",
    purpose: "Treatment of depression, anxiety, and related conditions.",
    price: 35.0,
    stock: 90,
    description: "Selective serotonin reuptake inhibitor (SSRI) antidepressant.",
    activeIngredient: "Sertraline Hydrochloride",
    manufacturer: "Intas Pharmaceuticals",
    expiryDate: new Date("2027-01-31"),
    batchNumber: "SER50INT0126",
    alternatives: ["Zoloft", "Lustral"]
  },
  {
    name: "Azithromycin 500mg Tablet",
    category: "Antibiotics",
    purpose: "Treatment of bacterial infections including respiratory tract infections.",
    price: 45.0,
    stock: 150,
    description: "Macrolide antibiotic effective against various bacterial infections.",
    activeIngredient: "Azithromycin",
    manufacturer: "Sun Pharmaceutical",
    expiryDate: new Date("2026-09-30"),
    batchNumber: "AZT500SUN0925",
    alternatives: ["Zithromax", "Azee"]
  }
]

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const database = client.db("pharma")
    const medicinesCollection = database.collection("inventories")

    // Delete existing data
    await medicinesCollection.deleteMany({})
    console.log("Cleared existing medicines data")

    // Insert new data
    const result = await medicinesCollection.insertMany(medicines)
    console.log(`${result.insertedCount} medicines inserted successfully`)

    // Create indexes for better search performance
    await medicinesCollection.createIndex({
      name: "text",
      category: "text",
      purpose: "text",
      activeIngredient: "text"
    })
    console.log("Created text search indexes")
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedDatabase().catch(console.error)
