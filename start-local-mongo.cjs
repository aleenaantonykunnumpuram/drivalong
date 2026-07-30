const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

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
  console.log("🚀 Initializing MongoDB connection for RIDE...");
  
  let mongod = null;
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const dbPath = path.join(__dirname, "mongodb-data");
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "RIDE",
        dbPath: dbPath,
        storageEngine: "wiredTiger",
      },
    });
    console.log("✅ Embedded MongoDB server active on mongodb://127.0.0.1:27017/RIDE");
  } catch (err) {
    console.log(`ℹ️ Connecting directly to MongoDB at ${MONGODB_URI}...`);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected successfully to MongoDB database 'RIDE'!`);

    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, "utf-8");
      const jsonRecords = JSON.parse(rawData);
      const collection = mongoose.connection.db.collection("customers");

      let importedCount = 0;
      for (const rawRecord of jsonRecords) {
        const doc = { ...rawRecord };
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
        console.log(`  └─ Synced customer: ${doc.name} (${doc.email})`);
      }

      const totalCount = await collection.countDocuments();
      console.log(`\n🎉 Connection & Sync Successful!`);
      console.log(`   Total records in MongoDB collection 'customers': ${totalCount}`);
    }

    if (mongod) {
      console.log("\n🟢 Embedded MongoDB server is running in background at mongodb://127.0.0.1:27017/RIDE");
      console.log("Press Ctrl+C to stop.");
      setInterval(() => {}, 10000);
    } else {
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.log("\n💡 Make sure MongoDB service is running locally or provide a valid MONGODB_URI connection string in .env");
    process.exit(1);
  }
}

main();
