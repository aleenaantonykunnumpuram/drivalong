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

// Customer Schema for RIDE database
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema, "customers");

// Function to automatically initialize/verify the single Admin account
async function initSingleAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@drivalong.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecretPass123!";
    const adminName = process.env.ADMIN_NAME || "System Administrator";

    const existingAdmin = await Customer.findOne({ role: "admin" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Customer.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        age: 35,
        gender: "unspecified",
      });
      console.log(`👑 Single Admin account auto-created: ${adminEmail}`);
    } else {
      console.log(`👑 Single Admin account verified in MongoDB: ${existingAdmin.email}`);
    }
  } catch (err) {
    console.error("Failed to initialize single admin:", err.message);
  }
}

// Connect to MongoDB database RIDE
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Backend connected to database 'RIDE' on port 27017");
    initSingleAdmin();
  })
  .catch((err) => console.error("MongoDB Connection error:", err));


// Trip / Booking schema for the RIDE database
const TripSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customerId: String,
    customerEmail: { type: String, lowercase: true, index: true },
    customerName: String,
    customerPhone: String,
    driverName: { type: String, default: "Unassigned" },
    driverEmail: { type: String, default: "" },
    driverPhone: { type: String, default: "" },
    serviceType: { type: String, default: "Hourly Chauffeur" },
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
    bookingDate: String,
    bookingTime: String,
    duration: { type: String, default: "4 Hours" },
    transmission: { type: String, default: "Automatic" },
    specialInstructions: String,
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
    declineReason: { type: String, default: "" },
    bookingStatus: { type: String, default: "Pending" },
    paymentStatus: { type: String, default: "Paid" },
    paymentMethod: { type: String, default: "UPI" },
    status: { type: String, default: "pending" },
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
        const { name, email, phone, age, gender, password, role } = payload;

        // Security Guard: Only allow 'customer' or 'rider' via public signup. 'admin' is strictly forbidden!
        const assignedRole = role === "rider" ? "rider" : "customer";

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
          phone: phone ? phone.trim() : "",
          age: Number(age) || 0,
          gender: gender || "Unspecified",
          password: hashedPassword,
          role: assignedRole,
        });

        console.log(`Registered new ${assignedRole} in MongoDB RIDE database:`, newCustomer.email);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: `${assignedRole === "rider" ? "Driver" : "Customer"} registered successfully in MongoDB!`,
            user: {
              id: newCustomer._id,
              name: newCustomer.name,
              email: newCustomer.email,
              phone: newCustomer.phone,
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
      const {
        customerId,
        customerEmail,
        customerName,
        customerPhone,
        serviceType,
        pickup,
        drop,
        bookingDate,
        bookingTime,
        duration,
        transmission,
        specialInstructions,
        vehicleType,
        distanceKm,
        durationMinutes,
        durationInTrafficMinutes,
        etaTime,
        routePolyline,
        paymentMethod,
        fare,
      } = payload;

      if (!pickup || !fare) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "pickup and fare are required." }));
        return;
      }

      const bookingId = "DAL" + Math.floor(100000 + Math.random() * 900000);

      const trip = await Trip.create({
        bookingId,
        customerId,
        customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : "",
        customerName: customerName || "Customer",
        customerPhone: customerPhone || "",
        driverName: "Unassigned",
        driverEmail: "",
        driverPhone: "",
        serviceType: serviceType || "Hourly Chauffeur",
        pickup,
        drop: drop || null,
        bookingDate: bookingDate || new Date().toISOString().slice(0, 10),
        bookingTime: bookingTime || "Now",
        duration: duration || "4 Hours",
        transmission: transmission || "Automatic",
        specialInstructions: specialInstructions || "",
        vehicleType: vehicleType || "sedan",
        distanceKm: distanceKm || 0,
        durationMinutes: durationMinutes || 60,
        durationInTrafficMinutes,
        etaTime: etaTime ? new Date(etaTime) : new Date(),
        routePolyline: routePolyline || "",
        paymentMethod: paymentMethod || "UPI",
        fare,
        bookingStatus: "Pending",
        paymentStatus: "Paid",
        status: "pending",
      });

      console.log(`📌 New Booking created in MongoDB: ${trip.bookingId} (Status: Pending) for ${trip.customerEmail || "Guest"}`);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, bookingId: trip.bookingId }));
    } catch (err) {
      console.error("Create Booking API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  // POST /api/bookings/assign — Admin assigns driver to trip
  if (req.method === "POST" && url === "/api/bookings/assign") {
    try {
      const body = await readJsonBody(req);
      const { bookingId, driverName, driverEmail, driverPhone, bookingStatus } = body;

      if (!bookingId || !driverName) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "bookingId and driverName are required." }));
        return;
      }

      const updatedTrip = await Trip.findOneAndUpdate(
        { bookingId },
        {
          driverName,
          driverEmail: driverEmail ? driverEmail.toLowerCase().trim() : "",
          driverPhone: driverPhone || "",
          bookingStatus: bookingStatus || "Assigned",
          status: bookingStatus === "Assigned" ? "approved" : "pending",
        },
        { new: true }
      );

      if (!updatedTrip) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Booking not found." }));
        return;
      }

      console.log(`👑 Admin assigned Driver ${driverName} to Booking ${bookingId}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Driver assigned successfully!", trip: updatedTrip }));
    } catch (err) {
      console.error("Assign Driver API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  // POST /api/bookings/update-status — Update trip status
  if (req.method === "POST" && url === "/api/bookings/update-status") {
    try {
      const body = await readJsonBody(req);
      const { bookingId, bookingStatus, status, declineReason } = body;

      if (!bookingId || (!bookingStatus && !status)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "bookingId and status are required." }));
        return;
      }

      const newBookingStatus = bookingStatus || (status === "approved" ? "Approved" : status === "declined" ? "Declined" : "Pending");
      const newStatus = status || (newBookingStatus === "Approved" || newBookingStatus === "Assigned" ? "approved" : newBookingStatus === "Declined" ? "declined" : "pending");

      const updateFields = {
        bookingStatus: newBookingStatus,
        status: newStatus,
      };

      if (declineReason !== undefined) {
        updateFields.declineReason = declineReason;
      }

      const updatedTrip = await Trip.findOneAndUpdate(
        { bookingId },
        updateFields,
        { new: true }
      );

      if (!updatedTrip) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Booking not found." }));
        return;
      }

      console.log(`🔄 Updated Booking ${bookingId} status to: ${newBookingStatus} (${newStatus})`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Status updated successfully!", trip: updatedTrip }));
    } catch (err) {
      console.error("Update Status API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  // GET /api/bookings — retrieves trips (filtered by customer email, driver email, or all for admin)
  if (req.method === "GET" && (url.startsWith("/api/bookings?") || url === "/api/bookings")) {
    try {
      const urlObj = new URL(url, `http://${req.headers.host || "127.0.0.1"}`);
      const email = urlObj.searchParams.get("email");
      const driverEmail = urlObj.searchParams.get("driverEmail");

      let query = {};
      if (email) {
        query.customerEmail = email.toLowerCase().trim();
      } else if (driverEmail) {
        const cleanDriverEmail = driverEmail.toLowerCase().trim();
        query.$or = [
          { driverEmail: cleanDriverEmail },
          { driverName: { $regex: new RegExp(cleanDriverEmail.split("@")[0], "i") } },
        ];
      }

      const trips = await Trip.find(query).sort({ createdAt: -1 });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, count: trips.length, trips }));
    } catch (err) {
      console.error("Get Bookings API Error:", err);
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

  // GET /api/customers — retrieves registered customers for Admin panel
  if (req.method === "GET" && url === "/api/customers") {
    try {
      const customers = await Customer.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, count: customers.length, customers }));
    } catch (err) {
      console.error("Get Customers API Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: err.message || "Database error." }));
    }
    return;
  }

  // GET /api/drivers — retrieves registered driver (rider) accounts for Admin panel
  if (req.method === "GET" && url === "/api/drivers") {
    try {
      const drivers = await Customer.find({ role: "rider" }).select("-password").sort({ createdAt: -1 });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, count: drivers.length, drivers }));
    } catch (err) {
      console.error("Get Drivers API Error:", err);
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
