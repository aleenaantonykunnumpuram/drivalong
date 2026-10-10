# 🚗 Driv A Long — Professional On-Demand Chauffeur Platform

> **Your Driver · Your Car**  
> Background-verified, trained professional chauffeurs on demand for your personal or corporate vehicle.

---

## 🌟 Overview

**Driv A Long** is a modern full-stack web application designed for on-demand chauffeur booking and fleet management. Customers can hire verified drivers on an hourly, daily, round-trip, outstation, or designated driver basis for the cars they already own.

The platform provides an end-to-end operational suite:
- **Customer Experience**: Real-time route mapping, live traffic-based fare estimation, booking wizard, ride history, and PDF invoice generation.
- **Driver Portal**: Real-time ride assignment, status progression (*Assigned*, *In Progress*, *Completed*), and route navigation.
- **Admin Management Panel**: Comprehensive booking dispatch, driver verification & onboarding, customer database with integrated review & rating metrics, and review moderation with instant deletion.
- **MongoDB Backend**: High-performance persistence layer with Mongoose schemas for customers, trips, and verified customer reviews.

---

## 🚀 Key Features

### 1. 📍 Live Route & Trip Estimation
- **Google Maps & Directions API Integration**: Interactive map with live origin/destination autocomplete, interactive polyline route rendering, and traffic-aware ETA calculation.
- **Transparent Tariff Calculator**: Dynamic pricing formula considering base fare, distance (₹/km), time (₹/hr), and vehicle multipliers (Hatchback, Sedan, SUV, Luxury, EV).

### 2. 📋 Multi-Step Booking Wizard
- Service type selection: Hourly Chauffeur, Round-Trip, One-Way Outstation, Designated Driver, or Corporate Fleet.
- Vehicle transmission specification (Manual / Automatic) and special instructions.
- Real-time fare breakdown before booking confirmation.

### 3. 🛡️ Single Administrator Control Center
- **Booking Management**: Review, approve, or decline incoming ride requests with custom decline reasons.
- **Driver Dispatch**: Assign verified chauffeurs directly to approved bookings.
- **Customer Account Directory**: View customer registration details along with aggregated **Reviews** count and **Rating** (⭐ 1-5 Stars) columns.
- **Review Moderation**: Toggle featured reviews on the homepage or delete reviews with 1-click instant removal.

### 4. 👤 Customer Dashboard & Ride Reviews
- Toggle between active/upcoming bookings and ride history.
- Download formatted PDF Ride Summary Receipts.
- Submit ratings and reviews for verified completed journeys.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, TanStack Start, TanStack Router, Vite |
| **Styling** | TailwindCSS v4, Lucide React, Radix UI primitives |
| **Backend / API** | TanStack Server Functions, Node.js HTTP Server (`mongo-backend.cjs`) |
| **Database** | MongoDB / Mongoose |
| **Mapping & Location** | Google Maps JavaScript API, Google Places Autocomplete, Google Directions API |
| **Authentication** | Role-based authentication (Customer, Driver/Rider, Admin) with bcryptjs |
| **Utilities** | Sonner (Toast notifications), jsPDF (Receipt generation), Zod (Validation) |

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── booking/         # Booking wizard, Google Maps, fare summary
│   │   ├── site/            # Navbar, Footer, and landing page sections
│   │   └── ui/              # Reusable UI components (Buttons, Modals, Inputs)
│   ├── lib/
│   │   ├── api/             # Trip, driver, and review server functions
│   │   ├── auth.ts          # Client-side authentication context
│   │   ├── pricing.ts       # Service catalog and rate formulas
│   │   └── mongodb.ts       # Database connection helper
│   ├── models/              # Mongoose schemas (Customer, Trip, Review)
│   └── routes/              # TanStack file-based routing
│       ├── __root.tsx       # Root layout & navigation shell
│       ├── index.tsx        # Public landing page
│       ├── book.tsx         # Interactive booking wizard
│       ├── admin.tsx        # Administrator control panel
│       ├── dashboard.tsx    # Customer ride dashboard
│       └── driver.tsx       # Driver assignment & ride execution
├── mongo-backend.cjs        # Standalone Node.js + MongoDB API server (Port 5000)
├── start-local-mongo.cjs    # Automated local MongoDB instance runner
├── import-to-mongodb.cjs    # Database seeder script
├── RIDE.customers.json      # Sample dataset for seed import
└── package.json             # Scripts and dependencies
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local community edition or Atlas URI)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/aleenaantonykunnumpuram/drivalong.git
cd drivalong
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/RIDE
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
GOOGLE_MAPS_SERVER_API_KEY=your_google_maps_server_key
ADMIN_EMAIL=admin@drivalong.com
ADMIN_PASSWORD=AdminSecretPass123!
```

### 3. Start Database & Backend API
In a separate terminal, start the local MongoDB backend:
```bash
npm run db:server
```

*(Optional) Seed sample customer data:*
```bash
npm run db:import
```

### 4. Run Development Server
Start the frontend development server:
```bash
npm run dev
```

The app will be accessible at:
```
http://localhost:5173
```

---

## 🧪 Build & Verification

To verify TypeScript types and build for production:
```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## 📄 License
Private & Proprietary — Developed for **Driv A Long Private Limited**.
