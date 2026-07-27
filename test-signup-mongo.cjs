const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/RIDE";

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema, "customers");

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const testEmail = `newuser_${Date.now()}@example.com`;
  const hashedPassword = await bcrypt.hash("password123", 10);

  const newDoc = await Customer.create({
    name: "New Registered User",
    email: testEmail,
    phone: "+91 99999 88888",
    password: hashedPassword,
    role: "customer",
  });

  console.log("✅ Successfully registered new user in MongoDB!");
  console.log("   ID:", newDoc._id);
  console.log("   Name:", newDoc.name);
  console.log("   Email:", newDoc.email);

  const count = await Customer.countDocuments();
  console.log("   Total customers now in MongoDB:", count);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
