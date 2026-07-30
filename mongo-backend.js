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

// Trip / Booking schema for the RIDE database
const TripSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    pickup: {
      address: String,
      lat: Number,
      lng: Number,
    },
    drop: {
      address: String,
      lat: Number,
      lng: Number,
    },
    vehicleType: { type: String, default: "sedan" },
    distanceKm: Number,
    durationMinutes: Number,
    durationInTrafficMinutes: Number,
    etaTime: Date,
    routePolyline: String,
    fare: {
      baseFare: Number,
      ratePerKm: Number,
      ratePerHour: Number,
      distanceCharge: Number,
      timeCharge: Number,
      totalFare: Number,
    },
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

const Trip = mongoose.models.Trip || mongoose.model("Trip", TripSchema, "trips");

// ---------------------------------------------------------------------
// Driv-A-Long pricing formula
//   Total Fare = Base Fare (₹299) + (Distance in KM × ₹13) + (Duration in hours × ₹120)
// ---------------------------------------------------------------------
const PRICING = { baseFare: 299, ratePerKm: 13, ratePerHour: 120 };
const VEHICLE_MULTIPLIERS = {
  hatchback: 0.85,
  sedan: 1,
  suv: 1.3,
  luxury: 1.85,
  ev: 0.95,
};

function calculateFare(distanceKm, durationMinutes, vehicleType) {
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] ?? 1;
  const ratePerKm = Math.round(PRICING.ratePerKm * multiplier * 100) / 100;
  const ratePerHour = Math.round(PRICING.ratePerHour * multiplier * 100) / 100;
  const distanceCharge = Math.round(distanceKm * ratePerKm);
  const timeCharge = Math.round((durationMinutes / 60) * ratePerHour);
  const totalFare = Math.round(PRICING.baseFare + distanceCharge + timeCharge);
  return {
    baseFare: PRICING.baseFare,
    ratePerKm,
    ratePerHour,
    distanceCharge,
    timeCharge,
    totalFare,
  };
}

function getGoogleApiKey() {
  return process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
}

// Calls the Google Directions API for driving directions with live traffic.
async function fetchDirections(origin, destination) {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    const err = new Error("Google Maps server API key is not configured (GOOGLE_MAPS_SERVER_API_KEY).");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: "driving",
    departure_time: String(Math.floor(Date.now() / 1000)),
    traffic_model: "best_guess",
    key: apiKey,
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);
  const data = await res.json();

  if (data.status !== "OK") {
    const err = new Error(data.error_message || `Directions API returned status ${data.status}`);
    err.code = data.status;
    throw err;
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    distanceKm: Math.round((leg.distance.value / 1000) * 10) / 10,
    durationMinutes: Math.round(leg.duration.value / 60),
    durationInTrafficMinutes: leg.duration_in_traffic ? Math.round(leg.duration_in_traffic.value / 60) : null,
    startAddress: leg.start_address,
    endAddress: leg.end_address,
    routePolyline: route.overview_polyline ? route.overview_polyline.points : "",
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

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

  // POST /api/fare-estimate
  // Body: { pickup: {lat,lng,address?}, drop: {lat,lng,address?}, vehicleType? }
  // Calls the Google Directions API, returns distance/duration/ETA/polyline/fare.
  if (req.method === "POST" && url === "/api/fare-estimate") {
    try {
      const payload = await readJsonBody(req);
      const { pickup, drop, vehicleType = "sedan" } = payload;

      if (!pickup || !drop || typeof pickup.lat !== "number" || typeof drop.lat !== "number") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "pickup {lat,lng} and drop {lat,lng} are required." }));
        return;
      }

      const directions = await fetchDirections(pickup, drop);
      const effectiveDuration = directions.durationInTrafficMinutes ?? directions.durationMinutes;
      const fare = calculateFare(directions.distanceKm, effectiveDuration, vehicleType);
      const etaTime = new Date(Date.now() + effectiveDuration * 60000);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          distanceKm: directions.distanceKm,
          durationMinutes: directions.durationMinutes,
          durationInTrafficMinutes: directions.durationInTrafficMinutes,
          effectiveDurationMinutes: effectiveDuration,
          etaTime: etaTime.toISOString(),
          startAddress: directions.startAddress,
          endAddress: directions.endAddress,
          routePolyline: directions.routePolyline,
          fare,
        })
      );
    } catch (err) {
      console.error("Fare Estimate API Error:", err);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Failed to calculate route.", code: err.code }));
    }
    return;
  }

  // POST /api/bookings — persists a confirmed trip estimate as a booking.
  if (req.method === "POST" && url === "/api/bookings") {
    try {
      const payload = await readJsonBody(req);
      const { pickup, drop, vehicleType, distanceKm, durationMinutes, durationInTrafficMinutes, etaTime, routePolyline, fare } = payload;

      if (!pickup || !drop || !fare) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "pickup, drop and fare are required." }));
        return;
      }

      const bookingId = "DAL" + Math.floor(100000 + Math.random() * 900000);

      const trip = await Trip.create({
        bookingId,
        pickup,
        drop,
        vehicleType: vehicleType || "sedan",
        distanceKm,
        durationMinutes,
        durationInTrafficMinutes,
        etaTime: etaTime ? new Date(etaTime) : new Date(),
        routePolyline: routePolyline || "",
        fare,
        status: "confirmed",
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, bookingId: trip.bookingId }));
    } catch (err) {
      console.error("Create Booking API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  // GET /api/bookings/:bookingId
  if (req.method === "GET" && url.startsWith("/api/bookings/")) {
    try {
      const bookingId = decodeURIComponent(url.split("/api/bookings/")[1] || "");
      const trip = await Trip.findOne({ bookingId });
      if (!trip) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Booking not found." }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, booking: trip }));
    } catch (err) {
      console.error("Get Booking API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`MongoDB Backend API listening on http://127.0.0.1:${PORT}`);
});
