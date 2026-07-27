const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const path = require("path");

if (!process.env.MONGODB_URI && fs.existsSync(path.join(__dirname, ".env"))) {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  const match = envContent.match(/^MONGODB_URI=["']?([^"'\r\n]+)["']?/m);
  if (match) {
    process.env.MONGODB_URI = match[1];
  }
}

const PORT = 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/RIDE";

// Connect to MongoDB database RIDE
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Backend connected to database 'RIDE' on port 27017"))
  .catch((err) => console.error("MongoDB Connection error:", err));

// Customer Schema for RIDE database
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema, "customers");

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url;

  if (req.method === "POST" && url === "/api/register") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { name, email, age, gender, password } = payload;

        if (!name || !email || !password) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Missing required fields." }));
          return;
        }

        // Check if customer already exists in RIDE database
        const existing = await Customer.findOne({ email: email.toLowerCase() });
        if (existing) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Email already registered in MongoDB." }));
          return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save into MongoDB RIDE database
        const newCustomer = await Customer.create({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          age: Number(age) || 0,
          gender: gender || "Unspecified",
          password: hashedPassword,
          role: "customer",
        });

        console.log("Registered new customer in MongoDB RIDE database:", newCustomer.email);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Customer registered successfully in MongoDB RIDE database!",
            user: {
              id: newCustomer._id,
              name: newCustomer.name,
              email: newCustomer.email,
              age: newCustomer.age,
              gender: newCustomer.gender,
              role: newCustomer.role,
            },
          })
        );
      } catch (err) {
        console.error("Register API Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
      }
    });
    return;
  }

  if (req.method === "POST" && url === "/api/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { email, password } = payload;

        if (!email || !password) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Email and password required." }));
          return;
        }

        const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
        if (!customer) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Invalid email or password." }));
          return;
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Invalid email or password." }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Login successful!",
            user: {
              id: customer._id,
              name: customer.name,
              email: customer.email,
              age: customer.age,
              gender: customer.gender,
              role: customer.role,
            },
          })
        );
      } catch (err) {
        console.error("Login API Error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`MongoDB Backend API listening on http://127.0.0.1:${PORT}`);
});
