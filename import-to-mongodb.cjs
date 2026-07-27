const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file if available
if (!process.env.MONGODB_URI && fs.existsSync(path.join(__dirname, ".env"))) {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  const match = envContent.match(/^MONGODB_URI=["']?([^"'\r\n]+)["']?/m);
  if (match) {
    process.env.MONGODB_URI = match[1];
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/RIDE";
const jsonPath = path.join(__dirname, "RIDE.customers.json");

async function main() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Successfully connected to local MongoDB database 'RIDE'!");

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const jsonRecords = JSON.parse(rawData);

    const db = mongoose.connection.db;
    const collection = db.collection("customers");

    let importedCount = 0;
    for (const rawRecord of jsonRecords) {
      const doc = { ...rawRecord };

      // Convert Extended JSON format ($oid, $date) to native BSON types if present
      if (doc._id && doc._id.$oid) {
        doc._id = new mongoose.Types.ObjectId(doc._id.$oid);
      }
      if (doc.createdAt && doc.createdAt.$date) {
        doc.createdAt = new Date(doc.createdAt.$date);
      }
      if (doc.updatedAt && doc.updatedAt.$date) {
        doc.updatedAt = new Date(doc.updatedAt.$date);
      }

      await collection.replaceOne({ email: doc.email }, doc, { upsert: true });
      importedCount++;
      console.log(`- Upserted customer: ${doc.name} (${doc.email})`);
    }

    const totalCount = await collection.countDocuments();
    console.log(`\nImport complete! ${importedCount} record(s) processed.`);
    console.log(`Total documents in 'RIDE.customers' collection: ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("MongoDB Connection / Import Error:", err.message);
    process.exit(1);
  }
}

main();
