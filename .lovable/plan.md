
# Professional Backend for Driv A Long

Build a production-grade backend on **Lovable Cloud** (managed Postgres + Auth + Storage + Server Functions) with **Customer, Driver, and Admin** roles, real-time driver tracking, and **Razorpay** for payments. All wired into the existing TanStack Start frontend — no more mocked data.

## 1. Enable Lovable Cloud

Turns on managed Postgres, Auth, Storage, and server-function runtime with generated Supabase clients (`supabase`, `requireSupabaseAuth`, `supabaseAdmin`).

## 2. Authentication

- Email/password + Google sign-in.
- Replace mocked `/login` with a real `/auth` route (sign-in + sign-up).
- `/reset-password` recovery route.
- Integration-managed `_authenticated` gate protects `/dashboard`, `/driver`, `/admin`, and post-selection booking steps.
- Root `onAuthStateChange` subscriber for cache/router freshness; strict sign-out hygiene (cancel queries, clear cache, replace nav).

## 3. Data Model (Postgres — schema, GRANTs, and RLS in ordered migrations)

- `app_role` enum (`customer`, `driver`, `admin`) + `user_roles` table + security-definer `has_role()` (roles never on profiles).
- `profiles` — auto-created via trigger on `auth.users` (name, phone, avatar).
- `drivers` — license #, KYC status, rating, availability, assigned vehicle, current lat/lng.
- `vehicles` — category (hatchback/sedan/suv/luxury/ev), transmission, plate, capacity, rates.
- `pricing_rules` — base fare, per-km, per-min, hourly packages, surge multipliers.
- `bookings` — customer, pickup/drop, trip_type, vehicle_category, scheduled_at, status (`pending → assigned → started → completed / cancelled`), OTP, fare snapshot, driver_id.
- `booking_events` — status-change audit log.
- `payments` — booking_id, provider (`razorpay`), provider_ref, amount, currency, status, `webhook_verified_at`.
- `driver_locations` — time-series `(driver_id, lat, lng, ts)`, indexed for realtime tracking.
- `reviews` — rating + comment per completed booking.

Every table ships explicit `GRANT` statements and RLS policies scoped by `auth.uid()` or `has_role()`.

## 4. Server Functions (`src/lib/*.functions.ts`, typed RPCs)

- **Booking**: `estimateFare`, `createBooking`, `cancelBooking`, `listMyBookings`, `getBooking`.
- **Driver**: `driverGoOnline/Offline`, `acceptBooking`, `startTrip`, `verifyOtp`, `completeTrip`, `updateLocation`.
- **Admin**: `listAllBookings`, `assignDriver`, `approveDriverKyc`, `listDrivers`, `metrics`.
- **Payments (Razorpay)**: `createRazorpayOrder` (server-side amount calc — never trust client), `confirmRazorpayPayment` (verifies signature).
- **Profile**: `getMyProfile`, `updateMyProfile`.

Privileged fns verify role via `has_role()` before importing `supabaseAdmin` inside the handler.

## 5. Public Server Routes (`src/routes/api/public/*`)

- `POST /api/public/webhooks/razorpay` — HMAC-verified webhook (`timingSafeEqual`) → mark `payments.status`, transition booking.
- `GET /api/public/health` — health check.

## 6. Real-time Driver Tracking

Supabase Realtime channels on `driver_locations` and `bookings.status` power live customer tracking, driver job feed, and admin monitoring — no polling.

## 7. Frontend Wiring (replace mocks)

Use `useServerFn` + TanStack Query (`ensureQueryData` in loaders, `useSuspenseQuery` in components):

- `/book` wizard → real `estimateFare` (step 4) → `createBooking` (step 5) → `createRazorpayOrder` + Razorpay checkout → `confirmRazorpayPayment`.
- `/dashboard` (customer) → `listMyBookings` + live tracking for active trip.
- `/driver` (new, gated by `driver` role) → job queue, accept, OTP verify, go online/offline, live location push.
- `/admin` (new, gated by `admin` role) → bookings table, driver KYC approval, metrics dashboard.

## 8. Secrets

Collected via `add_secret` at the payments step:
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

Public Razorpay key exposed as `VITE_RAZORPAY_KEY_ID` for the checkout script.

## 9. Out of scope

- Native mobile driver app (web driver dashboard covers MVP).
- SMS OTP delivery provider (trip OTP stored in DB; wire Twilio/MSG91 later).
- Automated KYC OCR (uploads to Storage; admin approves manually).

---

### Technical section

- Stack stays TanStack Start on Cloudflare Workers — no Node-only packages.
- Schema + GRANTs + RLS + triggers ship in ordered migrations; roles use `has_role()` security-definer to avoid RLS recursion.
- `supabaseAdmin` loaded inside handlers only (never at module scope of `*.functions.ts`).
- Protected server fns called from components or `_authenticated` loaders only — never from public loaders (SSR would 401).
- Razorpay webhook lives under `/api/public/*` with HMAC verification and Zod input validation.
- Realtime via `supabase.channel()` on `driver_locations` and `bookings`.
- Bearer middleware auto-registered in `src/start.ts` by the Supabase integration.

Approve to start with Cloud enablement + migrations + auth, then layer bookings, driver/admin dashboards, and Razorpay.
