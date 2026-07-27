const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "RIDE.customers.json");
const dbPath = path.join(__dirname, "mongodb-data");

async function main() {
  console.log("🚀 Initializing local MongoDB server on port 27017...");
  
  let mongod;
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "RIDE",
        dbPath: dbPath,
        storageEngine: "wiredTiger",
      },
    });
    console.log("✅ Local MongoDB server started successfully on mongodb://127.0.0.1:27017/RIDE");
  } catch (err) {
    if (err.message.includes("EADDRINUSE") || err.message.includes("already in use")) {
      console.log("ℹ️ MongoDB port 27017 is already in use by another MongoDB process. Connecting to existing instance...");
    } else {
      console.log("⚠️ Starting in-memory fallback MongoDB server on port 27017...");
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: "RIDE",
        },
      });
      console.log("✅ Fallback MongoDB server active on mongodb://127.0.0.1:27017/RIDE");
    }
  }

  // Connect and import RIDE.customers.json
  console.log("📦 Connecting and syncing customer data from RIDE.customers.json...");
  await mongoose.connect("mongodb://127.0.0.1:27017/RIDE");

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

  await mongoose.disconnect();

  if (mongod) {
    console.log("\n🟢 MongoDB server is currently running in the background at mongodb://127.0.0.1:27017/RIDE");
    console.log("Press Ctrl+C to stop.");
    // Keep process alive so MongoDB stays running
    setInterval(() => {}, 10000);
  }
}

main().catch((err) => {
  console.error("❌ MongoDB Setup Error:", err);
  process.exit(1);
});
