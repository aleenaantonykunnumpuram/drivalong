# Trip Estimation & Booking — Feature Guide

This document describes the accurate route calculation, fare estimation, and
map visualization system added to Driv-A-Long's booking flow (`/book`). The
existing UI/interface (the 6-step `BookingWizard`) is unchanged — only the
underlying data (distance, duration, ETA, fare) is now real, backend-verified
trip data instead of placeholders.

## 1. Pricing model

```
Base Fare       = ₹299
Rate per KM     = ₹13
Rate per Hour   = ₹120

Total Fare = Base Fare + (Distance in KM × ₹13) + (Duration in hours × ₹120)
```

Example — 72 km / 2 hours:

| Component        | Amount |
|-------------------|--------|
| Base Fare          | ₹299   |
| Distance Charge (72 × ₹13) | ₹936 |
| Time Charge (2 × ₹120)     | ₹240 |
| **Total Fare**      | **₹1475** |

The formula lives in one place — `src/lib/pricing.ts` — and is reused by
both the frontend and every backend entry point, so the numbers can never
drift out of sync. Vehicle classes (Hatchback / Sedan / SUV / Luxury / EV)
apply a small multiplier to the per-km and per-hour rates so the existing
vehicle picker still has meaningful pricing differences; the Sedan multiplier
is `1.0`, i.e. exactly the base formula above.

## 2. Architecture

This project is a **TanStack Start** app (React + SSR + server functions),
not a separate Express app — server functions in `src/lib/api/*.functions.ts`
are the idiomatic backend for this stack and run only on the server. A
lightweight companion **plain Node HTTP server** (`mongo-backend.js`) is also
included with equivalent REST endpoints for direct `curl`/Postman testing.

```
Frontend (React)
 ├─ LocationSearch.tsx        Google Places Autocomplete (pickup & drop)
 ├─ GoogleMapComponent.tsx    Orchestrates the whole trip-estimation flow
 ├─ RouteMap.tsx              Renders the map, markers, and route polyline
 └─ BookingSummary.tsx        Distance / Duration / ETA / Fare breakdown UI

Backend (server-only)
 ├─ src/lib/googleDirections.server.ts   Calls Google Directions API
 ├─ src/lib/pricing.ts                   Shared fare formula (isomorphic)
 ├─ src/lib/api/trip.functions.ts        getTripEstimate / createBooking
 ├─ src/models/Trip.ts                   Mongoose booking schema
 └─ mongo-backend.js                     REST equivalents for direct testing
```

### Request flow

1. Customer selects **Pickup** and **Drop** from Google Places Autocomplete
   suggestions only — `LocationSearch.tsx` only marks a field "verified"
   (green check) once a suggestion has been chosen, and `GoogleMapComponent`
   will not request an estimate until both fields are verified.
2. `GoogleMapComponent` calls the `getTripEstimate` server function with the
   two coordinate pairs (debounced 400ms).
3. The server function calls the **Google Directions API** with
   `departure_time=now` and `traffic_model=best_guess` so Google returns a
   live-traffic-aware `duration_in_traffic` whenever it's available.
4. The response — distance, duration, live-traffic duration, ETA, encoded
   route polyline, and a full fare breakdown — is returned to the client.
5. `RouteMap.tsx` decodes and draws the returned polyline directly (no
   second Directions API call from the browser) and places pickup/drop
   markers.
6. `BookingSummary.tsx` and the rest of the wizard display the real
   distance, travel time, ETA and fare breakdown before the customer taps
   **Book Now**.
7. On confirmation, `createBooking` persists the trip (route, fare, ETA) to
   MongoDB and returns a booking ID.

If the Directions API call fails or the server key isn't configured yet,
the UI automatically falls back to an offline Haversine-distance estimate
(clearly distinguishable from a real route) so the flow never breaks.

## 3. API documentation

### 3a. Server functions (used internally by the React app)

**`getTripEstimate`** — `src/lib/api/trip.functions.ts`

```ts
POST (server function)
Input:
{
  pickup: { lat: number, lng: number, address?: string },
  drop:   { lat: number, lng: number, address?: string },
  vehicleType: "hatchback" | "sedan" | "suv" | "luxury" | "ev"
}

Output (success):
{
  success: true,
  distanceKm: number,
  durationMinutes: number,
  durationInTrafficMinutes: number | null,
  effectiveDurationMinutes: number,   // traffic duration when available
  etaTime: string,                    // ISO timestamp
  startAddress: string,
  endAddress: string,
  routePolyline: string,              // encoded Google polyline
  fare: {
    baseFare: number, ratePerKm: number, ratePerHour: number,
    distanceCharge: number, timeCharge: number, totalFare: number,
    distanceKm: number, durationMinutes: number,
    vehicleType: string, vehicleMultiplier: number
  }
}

Output (failure):
{ success: false, error: string, status: string }
```

**`createBooking`** — `src/lib/api/trip.functions.ts`

```ts
POST (server function)
Input:
{
  pickup: { lat, lng, address }, drop: { lat, lng, address },
  vehicleType, distanceKm, durationMinutes, durationInTrafficMinutes?,
  etaTime, routePolyline?, fare: { baseFare, ratePerKm, ratePerHour,
  distanceCharge, timeCharge, totalFare }
}

Output: { success: true, bookingId: string }
```

### 3b. REST endpoints (`mongo-backend.js`, for direct testing)

Base URL: `http://127.0.0.1:5000`

| Method | Path | Description |
|---|---|---|
| POST | `/api/fare-estimate` | Same behaviour as `getTripEstimate` above |
| POST | `/api/bookings` | Same behaviour as `createBooking` above |
| GET | `/api/bookings/:bookingId` | Fetch a saved booking by ID |
| POST | `/api/register` | Existing customer signup |
| POST | `/api/login` | Existing customer login |

Example:

```bash
curl -X POST http://127.0.0.1:5000/api/fare-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "pickup": { "lat": 12.9716, "lng": 77.5946, "address": "MG Road, Bengaluru" },
    "drop":   { "lat": 13.1986, "lng": 77.7066, "address": "Kempegowda International Airport" },
    "vehicleType": "sedan"
  }'
```

## 4. Environment variables

Add/confirm these in `.env`:

```
VITE_GOOGLE_MAPS_API_KEY=...        # public browser key: Maps JavaScript API + Places API
                                     # restrict by HTTP referrer (your domain)

GOOGLE_MAPS_SERVER_API_KEY=...      # server-only key: Directions API + Geocoding API
                                     # restrict by server IP address, never expose to the browser

MONGODB_URI=mongodb://127.0.0.1:27017/RIDE
```

Enable these APIs in the Google Cloud Console for your project:
**Maps JavaScript API**, **Places API**, **Directions API**, **Geocoding API**.

## 5. Installation

```bash
# 1. Install dependencies (all required packages — mongoose, zod,
#    @react-google-maps/api — already exist in package.json)
npm install

# 2. Add your Google Maps keys + MongoDB URI to .env (see section 4)

# 3. Start local MongoDB (optional helper script)
npm run db:start

# 4. Start the app (TanStack Start dev server, includes server functions)
npm run dev

# 5. (Optional) start the standalone REST/auth backend for direct API testing
npm run db:server
```

## 6. Testing instructions

1. Open `/book`, and in **Step 1 · Location** search a pickup address —
   type at least 3 characters and pick a result from the Google Places
   dropdown (typing freely and pressing Enter will NOT verify the field —
   this matches the "must select a suggestion" requirement).
2. Repeat for the drop-off field.
3. Once both fields show a green check, the map draws the driving route and
   the summary card below fills in with **Distance**, **Travel Time**,
   **ETA**, and the full **fare breakdown** (Base / Distance / Time /
   Total) within ~1 second.
4. Change either location — the route, distance, duration, ETA and fare all
   recalculate automatically.
5. Change the vehicle in **Step 3 · Vehicle** and return to **Step 4 ·
   Pricing** — the fare breakdown updates using that vehicle's rate
   multiplier.
6. Complete the wizard to **Step 6 · Confirmed** — the displayed distance,
   duration and fare match Step 4 exactly, and a booking record is written
   to the `trips` collection in MongoDB (verify with `mongosh RIDE` →
   `db.trips.find().sort({createdAt:-1}).limit(1)`).
7. To test the fallback path, temporarily remove `GOOGLE_MAPS_SERVER_API_KEY`
   from `.env` and repeat step 3 — you should see an "offline estimate"
   fare/route based on straight-line distance instead of a hard failure.
8. REST endpoint smoke test: run the `curl` example in section 3b and
   confirm the JSON response contains `distanceKm`, `fare.totalFare`, and a
   non-empty `routePolyline`.
