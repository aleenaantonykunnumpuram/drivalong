import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin, Navigation, ArrowRight, ArrowLeft, Car, RouteIcon, Clock, Calendar,
  Users, Briefcase, Snowflake, Cog, CheckCircle2, CreditCard, Wallet, Banknote,
  Star, Phone, MessageSquare, Share2, Download, Home, Sparkles, Zap, Lock, ShieldCheck, Loader2, CheckSquare, Square, X,
} from "lucide-react";
import { GoogleMapComponent, type TripMetrics } from "./maps/GoogleMapComponent";
import { formatCurrency, VEHICLE_MULTIPLIERS, PRICING } from "./maps/fareUtils";
import { createBooking } from "@/lib/api/trip.functions";

type TripType = "one-way" | "round" | "outstation" | "rental";
type Vehicle = "hatchback" | "sedan" | "suv" | "luxury" | "ev";
type Transmission = "automatic" | "manual";
type Timing = "now" | "later";
type Package = "1h" | "2h" | "3h" | "4h" | "payg";
type PayMode = "before" | "after";

interface State {
  step: number;
  pickup: string;
  drop: string;
  pickupCoords: { lat: number; lng: number } | null;
  dropCoords: { lat: number; lng: number } | null;
  tripType: TripType;
  vehicle: Vehicle;
  transmission: Transmission;
  timing: Timing;
  date: string;
  time: string;
  pkg: Package;
  payMode: PayMode;
  payMethod: string;
  tripMetrics: TripMetrics | null;
}

const STEPS = ["Location", "Trip Type", "Vehicle", "Pricing", "Payment", "Confirmed"];

export function BookingWizard() {
  const [s, setS] = useState<State>({
    step: 0,
    pickup: "",
    drop: "",
    pickupCoords: null,
    dropCoords: null,
    tripType: "one-way",
    vehicle: "sedan",
    transmission: "automatic",
    timing: "now",
    date: new Date().toISOString().slice(0, 10),
    time: "18:30",
    pkg: "payg",
    payMode: "before",
    payMethod: "UPI",
    tripMetrics: null,
  });

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const next = () => setS((p) => ({ ...p, step: Math.min(p.step + 1, STEPS.length - 1) }));
  const back = () => setS((p) => ({ ...p, step: Math.max(p.step - 1, 0) }));

  return (
    <div className="rounded-[28px] border border-border bg-background shadow-lift">
      <div className="border-b border-border p-6 md:p-8">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Booking
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {s.step < 5 ? "Let's set up your ride" : "You're all set."}
        </h1>
        <ProgressBar step={s.step} />
      </div>

      <div className="p-6 md:p-8">
        {s.step === 0 && <StepLocation s={s} set={set} onNext={next} />}
        {s.step === 1 && <StepTripType s={s} set={set} onNext={next} onBack={back} />}
        {s.step === 2 && <StepVehicle s={s} set={set} onNext={next} onBack={back} />}
        {s.step === 3 && <StepPricing s={s} onNext={next} onBack={back} />}
        {s.step === 4 && <StepPayment s={s} set={set} onNext={next} onBack={back} />}
        {s.step === 5 && <StepConfirmation s={s} />}
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = (step / (STEPS.length - 1)) * 100;
  return (
    <div className="mt-6">
      <div className="relative h-1.5 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 hidden justify-between text-xs font-medium text-muted-foreground sm:flex">
        {STEPS.map((label, i) => (
          <span key={label} className={i <= step ? "text-primary" : ""}>
            {String(i + 1).padStart(2, "0")} · {label}
          </span>
        ))}
      </div>
      <div className="mt-2 text-xs text-muted-foreground sm:hidden">
        Step {step + 1} of {STEPS.length} · <span className="text-foreground">{STEPS[step]}</span>
      </div>
    </div>
  );
}
/* ------------------------ Step 1 · Location ------------------------ */

function StepLocation({ s, set, onNext }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void }) {
  const canContinue = Boolean(s.tripMetrics);
  return (
    <div className="animate-rise space-y-6">
      <GoogleMapComponent
        pickup={s.pickup}
        drop={s.drop}
        vehicleType={s.vehicle}
        onPickupChange={(v, coords) => {
          set("pickup", v);
          if (coords) set("pickupCoords", coords);
        }}
        onDropChange={(v, coords) => {
          set("drop", v);
          if (coords) set("dropCoords", coords);
        }}
        onMetricsCalculated={(metrics) => set("tripMetrics", metrics)}
      />

      <div className="flex items-center justify-end gap-3">
        {!canContinue && (
          <p className="text-xs text-muted-foreground">Select pickup & drop-off to continue</p>
        )}
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LocationField({ dot, label, value, onChange, suggestions, rightAction }: { dot: "primary" | "secondary"; label: string; value: string; onChange: (v: string) => void; suggestions: string[]; rightAction?: React.ReactNode }) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="relative">
      <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span> {rightAction}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring">
        <span className={`h-2.5 w-2.5 shrink-0 ${dot === "primary" ? "rounded-full bg-primary" : "rounded-sm bg-secondary"}`} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Start typing…"
        />
      </div>
      {focus && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lift">
          {suggestions.filter((x) => x.toLowerCase().includes(value.toLowerCase()) || value === "").slice(0, 4).map((sg, i) => (
            <button key={i} onMouseDown={() => onChange(sg)} className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-sm last:border-0 hover:bg-muted">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{sg}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapPreview() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-border bg-subtle">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0">
        {/* fake roads */}
        <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0 220 C 80 180, 160 260, 240 200 S 380 120, 400 140" stroke="#E5EAF2" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M0 220 C 80 180, 160 260, 240 200 S 380 120, 400 140" stroke="#0B5FFF" strokeWidth="3" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
          <path d="M20 40 L 380 60" stroke="#EEF1F6" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M100 0 L 130 300" stroke="#EEF1F6" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute left-6 top-40">
        <div className="relative">
          <div className="absolute inset-0 -m-2 animate-pulse-ring rounded-full" />
          <div className="h-4 w-4 rounded-full border-4 border-primary bg-background" />
        </div>
        <div className="mt-1.5 rounded-lg bg-background px-2 py-0.5 text-[10px] font-semibold shadow-soft">Pickup</div>
      </div>
      <div className="absolute right-8 top-20">
        <div className="h-4 w-4 rounded-sm border-4 border-secondary bg-background" />
        <div className="mt-1.5 rounded-lg bg-background px-2 py-0.5 text-[10px] font-semibold shadow-soft">Drop</div>
      </div>
      <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium shadow-soft backdrop-blur">
        Live map preview
      </div>
    </div>
  );
}

/* ------------------------ Step 2 · Trip Type ------------------------ */

function StepTripType({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const types: { id: TripType; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "one-way", title: "One Side Trip", desc: "Travel from one location to another.", icon: MapPin },
    { id: "round", title: "Round Trip", desc: "Travel and return the same day.", icon: RouteIcon },
    { id: "outstation", title: "Outstation", desc: "Long distance intercity travel.", icon: Car },
    { id: "rental", title: "Daily Rental", desc: "Hire a driver for multiple hours.", icon: Clock },
  ];
  return (
    <div className="animate-rise">
      <div className="grid gap-4 sm:grid-cols-2">
        {types.map((t) => {
          const active = s.tripType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => set("tripType", t.id)}
              className={`group flex items-start gap-4 rounded-3xl border-2 p-5 text-left transition ${active ? "border-primary bg-primary/5 shadow-ring" : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft"}`}
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{t.title}</h3>
                  {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      <NavRow onNext={onNext} onBack={onBack} />
    </div>
  );
}

/* ------------------------ Step 3 · Vehicle ------------------------ */

const VEHICLES: { id: Vehicle; name: string; seats: number; luggage: number; ac: boolean; auto: boolean; rate: number }[] = [
  { id: "hatchback", name: "Hatchback", seats: 4, luggage: 2, ac: true, auto: true, rate: 9 },
  { id: "sedan", name: "Sedan", seats: 4, luggage: 3, ac: true, auto: true, rate: 12 },
  { id: "suv", name: "SUV", seats: 6, luggage: 4, ac: true, auto: true, rate: 16 },
  { id: "luxury", name: "Luxury", seats: 4, luggage: 3, ac: true, auto: true, rate: 28 },
  { id: "ev", name: "Electric", seats: 4, luggage: 2, ac: true, auto: true, rate: 11 },
];

function StepVehicle({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-rise space-y-6">
      <div className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transmission</div>
            <div className="mt-3 flex gap-2">
              {(["automatic", "manual"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => set("transmission", t)}
                  className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-semibold capitalize transition ${s.transmission === t ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-subtle hover:border-primary/50"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking time</div>
            <div className="mt-3 flex gap-2">
              {(["now", "later"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => set("timing", t)}
                  className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-semibold capitalize transition ${s.timing === t ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-subtle hover:border-primary/50"}`}
                >
                  {t === "now" ? "Now" : "Schedule Later"}
                </button>
              ))}
            </div>
            {s.timing === "later" && (
              <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
                <div className="rounded-2xl border border-border bg-background px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Calendar className="h-3 w-3" /> Date</div>
                  <input type="date" value={s.date} onChange={(e) => set("date", e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
                </div>
                <div className="rounded-2xl border border-border bg-background px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Clock className="h-3 w-3" /> Time</div>
                  <input type="time" value={s.time} onChange={(e) => set("time", e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NavRow onNext={onNext} onBack={onBack} />
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">{icon}{children}</span>;
}

/* ------------------------ Step 4 · Pricing ------------------------ */

function StepPricing({ s, onNext, onBack }: { s: State; onNext: () => void; onBack: () => void }) {
  const fare = s.tripMetrics?.fare ?? null;

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Trip estimate</h3>
          <p className="mt-1 text-sm text-muted-foreground">Calculated from live driving distance & duration for your ride.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Distance</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.tripMetrics ? `${s.tripMetrics.distanceKm} km` : "—"}</div>
            </div>
            <div className="rounded-2xl border-2 border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Travel Time</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.tripMetrics ? s.tripMetrics.durationText : "—"}</div>
            </div>
            <div className="rounded-2xl border-2 border-border bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">ETA</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{s.tripMetrics ? s.tripMetrics.etaLabel : "—"}</div>
            </div>
          </div>
        </div>

        <div className="relative flex w-full items-center gap-5 rounded-3xl border-2 border-primary bg-primary/5 p-5 text-left shadow-ring">
          <span className="absolute right-4 top-4 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink">Upfront pricing</span>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold">Base + Distance + Time pricing</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              ₹{PRICING.baseFare} base fare + ₹{fare?.ratePerKm ?? PRICING.ratePerKm}/km + ₹{fare?.ratePerHour ?? PRICING.ratePerHour}/hr.
            </p>
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-border bg-subtle p-6">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Fare breakdown</h4>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row k="Base Fare" v={fare ? formatCurrency(fare.baseFare) : `₹${PRICING.baseFare}`} />
          <Row k={`Distance Charge (${fare?.distanceKm ?? 0} km × ₹${fare?.ratePerKm ?? PRICING.ratePerKm})`} v={fare ? formatCurrency(fare.distanceCharge) : "—"} />
          <Row k={`Time Charge (${fare ? (fare.durationMinutes / 60).toFixed(1) : "0"} hrs × ₹${fare?.ratePerHour ?? PRICING.ratePerHour})`} v={fare ? formatCurrency(fare.timeCharge) : "—"} />
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm font-medium">Total Fare</span>
          <span className="text-3xl font-semibold tracking-tight text-primary">{fare ? formatCurrency(fare.totalFare) : "—"}</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Final fare shown before payment. No hidden charges.</p>
        <button onClick={onNext} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
          Continue <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={onBack} className="mt-2 w-full rounded-2xl py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground">Back</button>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>;
}

/* ------------------------ Step 5 · Payment ------------------------ */

function StepPayment({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const beforeOptions = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"];
  const afterOptions = ["Cash", "UPI"];
  const active = s.payMode === "before" ? beforeOptions : afterOptions;
  
  useEffect(() => { 
    if (!active.includes(s.payMethod)) set("payMethod", active[0]); 
  }, [s.payMode]);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [txnDetails, setTxnDetails] = useState<{ txnId: string; bookingId: string; amount: string; method: string; dateStr: string } | null>(null);

  const fare = s.tripMetrics?.fare;
  const totalAmountStr = fare ? formatCurrency(fare.totalFare) : s.tripMetrics ? `₹${Math.round(s.tripMetrics.distanceKm * 13 + 299)}` : "₹797";
  const canPay = termsAgreed && policyAgreed;

  const handleProceedToPay = () => {
    if (!canPay || processing) return;
    setProcessing(true);

    setTimeout(() => {
      const randomTxn = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
      const randomBooking = "DAL" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + String(Math.floor(1000 + Math.random() * 9000));
      const nowStr = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      setTxnDetails({
        txnId: randomTxn,
        bookingId: randomBooking,
        amount: totalAmountStr,
        method: s.payMethod,
        dateStr: nowStr,
      });

      setProcessing(false);
      setShowModal(true);
    }, 2500);
  };

  const handleModalViewBooking = () => {
    setShowModal(false);
    onNext();
  };

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-5 relative">
      <div className="lg:col-span-3 space-y-5">
        <SummaryCard s={s} />

        <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Payment Options</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["before", "after"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("payMode", m)}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition ${s.payMode === m ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-background hover:border-primary/50"}`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={`h-3 w-3 rounded-full border-2 ${s.payMode === m ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  Pay {m === "before" ? "Before" : "After"} Trip
                </div>
                <p className="mt-1.5 pl-5 text-xs text-muted-foreground">{m === "before" ? "Card / UPI / Wallet" : "Cash or UPI on completion"}</p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Select Payment Method</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {active.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("payMethod", opt)}
                  className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-medium transition ${s.payMethod === opt ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-background hover:border-primary/50"}`}
                >
                  {opt === "Cash" ? <Banknote className="h-4 w-4" /> : opt === "Wallet" ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Selected Method:</span>
              <span className="font-semibold text-foreground bg-subtle px-2 py-0.5 rounded-lg border border-border">{s.payMethod}</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-border bg-primary p-6 text-primary-foreground shadow-lift lg:col-span-2 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">Amount payable</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              <Lock className="h-3 w-3 text-emerald-300" /> Secure Checkout
            </span>
          </div>

          <div className="mt-2 text-4xl font-bold tracking-tight">{totalAmountStr}</div>
          
          {/* Fare Breakdown Section */}
          <div className="mt-4 rounded-2xl bg-white/10 p-3.5 backdrop-blur text-xs space-y-2 text-primary-foreground/90 border border-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/70 border-b border-white/10 pb-1.5 flex justify-between">
              <span>Fare Breakdown</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between">
              <span>Base Fare</span>
              <span>{fare ? formatCurrency(fare.baseFare) : "₹299"}</span>
            </div>
            <div className="flex justify-between">
              <span>Distance Charge ({fare ? fare.distanceKm : s.tripMetrics ? s.tripMetrics.distanceKm : "31.1"} km)</span>
              <span>{fare ? formatCurrency(fare.distanceCharge) : "₹404"}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Charge ({fare ? (fare.durationMinutes / 60).toFixed(1) : "0.8"} hrs)</span>
              <span>{fare ? formatCurrency(fare.timeCharge) : "₹94"}</span>
            </div>
            <div className="flex justify-between border-t border-white/15 pt-2 text-sm font-bold text-white">
              <span>Total Amount</span>
              <span>{totalAmountStr}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mt-4 space-y-1.5 text-xs text-primary-foreground/90">
            <div className="font-semibold text-primary-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Cancellation Policy
            </div>
            <ul className="space-y-1 pl-1 text-[11px] text-primary-foreground/80">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> Free cancellation within 5 minutes</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> Cancellation charges may apply after driver assignment</li>
            </ul>
          </div>

          {/* Security Note */}
          <div className="mt-4 rounded-xl bg-black/20 p-2.5 text-[11px] text-center font-medium text-primary-foreground/80 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span>🔒 Secure & Encrypted Checkout (Demo Payment)</span>
          </div>

          {/* Agreement Checkboxes */}
          <div className="mt-4 space-y-2 text-xs">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary accent-emerald-400 cursor-pointer"
              />
              <span className="text-[11px] text-primary-foreground/90">I agree to the Terms & Conditions</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={policyAgreed}
                onChange={(e) => setPolicyAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary accent-emerald-400 cursor-pointer"
              />
              <span className="text-[11px] text-primary-foreground/90">I agree to the Cancellation Policy</span>
            </label>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleProceedToPay}
            disabled={!canPay || processing}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold shadow-lift transition ${
              canPay && !processing
                ? "bg-white text-primary hover:brightness-105"
                : "bg-white/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                Proceed to Pay ({s.payMethod}) <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="mt-2 w-full rounded-2xl py-2.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </aside>

      {/* Payment Success Modal */}
      {showModal && txnDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-lift text-center space-y-5 animate-scale-up">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 mb-1">
                ✅ Payment Successful
              </span>
              <h3 className="text-xl font-bold tracking-tight text-foreground">Ride Confirmed!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your chauffeur has been booked successfully.</p>
            </div>

            <div className="rounded-2xl border border-border bg-subtle p-4 text-xs space-y-2.5 text-left">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Transaction ID</span>
                <span className="font-mono font-bold text-foreground">{txnDetails.txnId}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Booking ID</span>
                <span className="font-mono font-bold text-primary">{txnDetails.bookingId}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Amount Paid</span>
                <span className="font-bold text-emerald-600 text-sm">{txnDetails.amount}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Payment Method</span>
                <span className="font-semibold text-foreground">{txnDetails.method}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Date & Time</span>
                <span className="font-medium text-foreground">{txnDetails.dateStr}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Paid
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-border bg-subtle px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleModalViewBooking}
                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110 transition flex items-center justify-center gap-1.5"
              >
                View Booking <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ s }: { s: State }) {
  const tt = ({ "one-way": "One Side", round: "Round Trip", outstation: "Outstation", rental: "Daily Rental" } as Record<TripType, string>)[s.tripType];
  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
      <h3 className="text-lg font-semibold">Trip summary</h3>
      <div className="mt-4 space-y-3 text-sm">
        <SummaryRow k="Pickup" v={s.pickup || "Not selected"} dot="primary" />
        <SummaryRow k="Drop" v={s.drop || "Not selected"} dot="secondary" />
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-5">
          <Meta k="Transmission" v={s.transmission} />
          <Meta k="Trip Type" v={tt} />
          <Meta k="Schedule" v={s.timing === "now" ? "Now" : `${s.date} · ${s.time}`} />
          <Meta k="Distance" v={s.tripMetrics ? `${s.tripMetrics.distanceKm} km` : "—"} />
          <Meta k="Duration" v={s.tripMetrics ? s.tripMetrics.durationText : "—"} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ k, v, dot }: { k: string; v: string; dot: "primary" | "secondary" }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 ${dot === "primary" ? "rounded-full bg-primary" : "rounded-sm bg-secondary"}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
        <div className="truncate text-sm font-medium">{v}</div>
      </div>
    </div>
  );
}
function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-subtle p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-0.5 truncate text-sm font-semibold">{v}</div>
    </div>
  );
}

/* ------------------------ Step 6 · Confirmation ------------------------ */

function StepConfirmation({ s }: { s: State }) {
  const v = VEHICLES.find((x) => x.id === s.vehicle)!;
  const [bookingId, setBookingId] = useState<string>(() => "DAL" + Math.floor(100000 + Math.random() * 900000));
  const otp = useMemo(() => Math.floor(1000 + Math.random() * 9000).toString(), []);

  // Persist the confirmed trip (route, fare breakdown, ETA) to MongoDB.
  useEffect(() => {
    if (!s.tripMetrics || !s.pickupCoords || !s.dropCoords) return;
    let cancelled = false;
    createBooking({
      data: {
        pickup: { lat: s.pickupCoords.lat, lng: s.pickupCoords.lng, address: s.pickup },
        drop: { lat: s.dropCoords.lat, lng: s.dropCoords.lng, address: s.drop },
        vehicleType: s.vehicle,
        distanceKm: s.tripMetrics.distanceKm,
        durationMinutes: s.tripMetrics.durationMinutes,
        durationInTrafficMinutes: s.tripMetrics.durationInTrafficMinutes ?? undefined,
        etaTime: s.tripMetrics.etaTime ?? new Date().toISOString(),
        routePolyline: s.tripMetrics.routePolyline ?? "",
        fare: {
          baseFare: s.tripMetrics.fare.baseFare,
          ratePerKm: s.tripMetrics.fare.ratePerKm,
          ratePerHour: s.tripMetrics.fare.ratePerHour,
          distanceCharge: s.tripMetrics.fare.distanceCharge,
          timeCharge: s.tripMetrics.fare.timeCharge,
          totalFare: s.tripMetrics.fare.totalFare,
        },
      },
    })
      .then((res) => {
        if (!cancelled && res.success) setBookingId(res.bookingId);
      })
      .catch((err) => console.error("Failed to save booking:", err));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-rise">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -m-6 animate-ping-slow rounded-full bg-primary/30" />
          <div className="animate-check-pop grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2.4} />
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight">Booking confirmed</h2>
        <p className="mt-1 text-sm text-muted-foreground">Booking ID · <span className="font-semibold text-foreground">{bookingId}</span></p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        {/* Driver card */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">RK</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Rajesh Kumar</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> 4.92 · 8 yrs experience
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Meta k="Vehicle" v={`${v.name} · Swift Dzire`} />
            <Meta k="Number" v="KA 05 MJ 4821" />
            <Meta k="Phone" v="+91 98450 12345" />
            <Meta k="Trip OTP" v={otp} />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { i: Phone, l: "Call" },
              { i: MessageSquare, l: "Chat" },
              { i: Share2, l: "Share" },
              { i: Download, l: "Invoice" },
            ].map((a, i) => (
              <button key={i} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background py-3 text-[11px] font-semibold text-muted-foreground transition hover:border-primary hover:text-primary">
                <a.i className="h-4 w-4" /> {a.l}
              </button>
            ))}
          </div>
        </div>

        {/* Trip live map */}
        <div className="lg:col-span-3 overflow-hidden rounded-3xl border border-border bg-subtle shadow-soft">
          <div className="relative h-56 md:h-64">
            <div className="absolute inset-0 grid-bg" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="none">
              <path d="M20 200 C 100 170, 180 210, 250 160 S 380 90, 390 60" stroke="#E5EAF2" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path d="M20 200 C 100 170, 180 210, 250 160 S 380 90, 390 60" stroke="#0B5FFF" strokeWidth="3" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
            </svg>
            <div className="absolute left-4 bottom-8">
              <div className="relative">
                <div className="absolute inset-0 -m-2 animate-pulse-ring rounded-full" />
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift">
                  <Car className="h-4 w-4" strokeWidth={2.4} />
                </div>
              </div>
              <div className="mt-1 rounded-lg bg-background px-2 py-0.5 text-[10px] font-semibold shadow-soft">Driver</div>
            </div>
            <div className="absolute right-6 top-6">
              <div className="h-4 w-4 rounded-sm border-4 border-secondary bg-background" />
              <div className="mt-1 rounded-lg bg-background px-2 py-0.5 text-[10px] font-semibold shadow-soft">Drop</div>
            </div>
            <div className="absolute right-4 bottom-4 rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-semibold shadow-soft">
              ETA · {s.tripMetrics?.etaLabel ?? "—"}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-background text-center text-sm">
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Distance</div>
              <div className="mt-1 font-semibold">{s.tripMetrics ? `${s.tripMetrics.distanceKm} km` : "—"}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Duration</div>
              <div className="mt-1 font-semibold">{s.tripMetrics?.durationText ?? "—"}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Fare</div>
              <div className="mt-1 font-semibold text-primary">{s.tripMetrics ? formatCurrency(s.tripMetrics.fare.totalFare) : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
          <Navigation className="h-4 w-4" /> Track Driver
        </button>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
          <Home className="h-4 w-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}

/* ------------------------ shared nav ------------------------ */

function NavRow({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <button onClick={onNext} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
