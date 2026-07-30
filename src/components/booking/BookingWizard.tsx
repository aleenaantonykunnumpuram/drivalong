import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin, Navigation, ArrowRight, ArrowLeft, Car, RouteIcon, Clock, Calendar,
  Users, Briefcase, Snowflake, Cog, CheckCircle2, CreditCard, Wallet, Banknote,
  Star, Phone, MessageSquare, Share2, Download, Home, Sparkles, Zap, Lock, ShieldCheck, Loader2, CheckSquare, Square, X,
  Shield, UserCheck, Plane, Award, Building2, PartyPopper, Compass
} from "lucide-react";
import { GoogleMapComponent, type TripMetrics } from "./maps/GoogleMapComponent";
import { formatCurrency, CHAUFFEUR_SERVICES, DURATION_HOURS, type ServiceType, type DurationOption } from "./maps/fareUtils";
import { createBooking } from "@/lib/api/trip.functions";
import { useAuthUser } from "@/lib/auth";

type Transmission = "automatic" | "manual";
type Timing = "now" | "later";
type PayMode = "before" | "after";

interface State {
  step: number;
  serviceType: ServiceType;
  pickup: string;
  drop: string;
  pickupCoords: { lat: number; lng: number } | null;
  dropCoords: { lat: number; lng: number } | null;
  transmission: Transmission;
  timing: Timing;
  date: string;
  time: string;
  duration: DurationOption;
  specialInstructions: string;
  payMode: PayMode;
  payMethod: string;
  tripMetrics: TripMetrics | null;
}

const STEPS = ["Service", "Pickup", "Schedule", "Duration", "Payment", "Confirmed"];

const SERVICE_ICONS: Record<ServiceType, any> = {
  "One-Way Chauffeur": Compass,
  "Hourly Chauffeur": Clock,
  "Full-Day Chauffeur": Award,
  "Airport Chauffeur": Plane,
  "Designated Driver": Shield,
  "Corporate Chauffeur": Building2,
  "Event Chauffeur": PartyPopper,
  "Outstation Chauffeur": Navigation,
};

export function BookingWizard() {
  const [s, setS] = useState<State>({
    step: 0,
    serviceType: "Hourly Chauffeur",
    pickup: "",
    drop: "",
    pickupCoords: null,
    dropCoords: null,
    transmission: "automatic",
    timing: "now",
    date: new Date().toISOString().slice(0, 10),
    time: "18:30",
    duration: "4 Hours",
    specialInstructions: "",
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
          <Sparkles className="h-3.5 w-3.5" /> Chauffeur Rental · Your Driver, Your Car
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {s.step < 5 ? "Book a Professional Chauffeur" : "Chauffeur Booking Confirmed"}
        </h1>
        <ProgressBar step={s.step} />
      </div>

      <div className="p-6 md:p-8">
        {s.step === 0 && <StepSelectService s={s} set={set} onNext={next} />}
        {s.step === 1 && <StepPickup s={s} set={set} onNext={next} onBack={back} />}
        {s.step === 2 && <StepSchedule s={s} set={set} onNext={next} onBack={back} />}
        {s.step === 3 && <StepDuration s={s} set={set} onNext={next} onBack={back} />}
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

/* ------------------------ Step 1 · Select Service ------------------------ */

function StepSelectService({ s, set, onNext }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void }) {
  const services = Object.entries(CHAUFFEUR_SERVICES) as [ServiceType, typeof CHAUFFEUR_SERVICES[ServiceType]][];

  return (
    <div className="animate-rise space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Select Chauffeur Service</h3>
        <p className="text-xs text-muted-foreground mt-0.5">We provide verified professional drivers to drive your own car.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(([key, service]) => {
          const IconComponent = SERVICE_ICONS[key] || UserCheck;
          const isSelected = s.serviceType === key;

          return (
            <div
              key={key}
              onClick={() => set("serviceType", key)}
              className={`group cursor-pointer rounded-3xl border-2 p-5 transition flex flex-col justify-between ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-soft ring-1 ring-primary/30"
                  : "border-border bg-background hover:border-primary/50 hover:shadow-soft"
              }`}
            >
              <div>
                <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl transition ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-subtle text-primary group-hover:bg-primary/10"
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-base text-foreground">{service.title}</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{service.description}</p>
              </div>

              <div className="mt-5 border-t border-border/60 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">From ₹{service.baseFare}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    set("serviceType", key);
                    onNext();
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-subtle text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110"
        >
          Continue to Pickup Location <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Step 2 · Pickup Location ------------------------ */

function StepPickup({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-rise space-y-6">
      <GoogleMapComponent
        pickup={s.pickup}
        drop={s.drop}
        serviceType={s.serviceType}
        duration={s.duration}
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

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Step 3 · Schedule & Transmission ------------------------ */

function StepSchedule({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="animate-rise space-y-6 max-w-2xl mx-auto">
      <div className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Transmission & Booking Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Specify your car's transmission type so we assign a qualified driver.</p>
        </div>

        {/* Transmission Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Vehicle Transmission</label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["automatic", "manual"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("transmission", t)}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  s.transmission === t ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold capitalize">
                  <Cog className={`h-4 w-4 ${s.transmission === t ? "text-primary" : "text-muted-foreground"}`} />
                  {t} Transmission
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t === "automatic" ? "Automated / AMT / Dual Clutch" : "Manual 5/6 Speed Stick Shift"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Booking Timing */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">When do you need the driver?</label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["now", "later"] as const).map((tm) => (
              <button
                key={tm}
                type="button"
                onClick={() => set("timing", tm)}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  s.timing === tm ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className={`h-4 w-4 ${s.timing === tm ? "text-primary" : "text-muted-foreground"}`} />
                  {tm === "now" ? "Immediate Pickup (15-20 min)" : "Schedule for Later"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {s.timing === "later" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                value={s.date}
                onChange={(e) => set("date", e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Time</label>
              <input
                type="time"
                value={s.time}
                onChange={(e) => set("time", e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110"
        >
          Continue to Duration <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Step 4 · Service Duration ------------------------ */

function StepDuration({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const durationOptions: DurationOption[] = [
    "1 Hour",
    "2 Hours",
    "4 Hours",
    "6 Hours",
    "8 Hours",
    "12 Hours",
    "Full Day",
  ];

  return (
    <div className="animate-rise space-y-6 max-w-3xl mx-auto">
      <div className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Select Service Duration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how long you require the chauffeur driver.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {durationOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => set("duration", opt)}
              className={`rounded-2xl border-2 p-4 text-center transition ${
                s.duration === opt ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <div className="text-base font-bold">{opt}</div>
              <div className={`mt-1 text-[11px] ${s.duration === opt ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {opt === "Full Day" ? "24 Hours max" : `${DURATION_HOURS[opt]} hrs included`}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Special Instructions (Optional)</label>
          <textarea
            rows={3}
            value={s.specialInstructions}
            onChange={(e) => set("specialInstructions", e.target.value)}
            placeholder="e.g. Car model Honda City, child seat needed, or specific parking instructions..."
            className="mt-2 w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110"
        >
          Review Fare & Pay <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------ Step 5 · Payment ------------------------ */

function StepPayment({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const { user } = useAuthUser();
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
  const serviceDetails = CHAUFFEUR_SERVICES[s.serviceType] || CHAUFFEUR_SERVICES["Hourly Chauffeur"];
  const durationHours = DURATION_HOURS[s.duration] || 4;
  const estimatedPrice = fare ? fare.totalFare : serviceDetails.baseFare + durationHours * serviceDetails.ratePerHour;
  const totalAmountStr = formatCurrency(estimatedPrice);
  const canPay = termsAgreed && policyAgreed;

  if (!user) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-4 animate-rise">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-600">
          <Lock className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Sign In Required to Book Chauffeur</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Only authenticated customers can book rides. Please log in or create an account to confirm your chauffeur driver.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110"
          >
            Sign In Now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedToPay = () => {
    if (!canPay || processing) return;
    setProcessing(true);

    setTimeout(() => {
      const randomTxn = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
      const randomBooking = "DAL" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + String(Math.floor(1000 + Math.random() * 9000));
      const nowStr = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

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
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-border bg-primary p-6 text-primary-foreground shadow-lift lg:col-span-2 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">Estimated Price</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur">
              <Lock className="h-3 w-3 text-emerald-300" /> Secure Checkout
            </span>
          </div>

          <div className="mt-2 text-4xl font-bold tracking-tight">{totalAmountStr}</div>

          {/* Fare Breakdown */}
          <div className="mt-4 rounded-2xl bg-white/10 p-3.5 backdrop-blur text-xs space-y-2 text-primary-foreground/90 border border-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/70 border-b border-white/10 pb-1.5 flex justify-between">
              <span>Chauffeur Fare Breakdown</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between">
              <span>Base Service Fee ({s.serviceType})</span>
              <span>₹{serviceDetails.baseFare}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration Charge ({s.duration})</span>
              <span>₹{durationHours * serviceDetails.ratePerHour}</span>
            </div>
            {fare && fare.distanceKm > 0 && (
              <div className="flex justify-between">
                <span>Distance Charge ({fare.distanceKm} km)</span>
                <span>₹{fare.distanceCharge}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/15 pt-2 text-sm font-bold text-white">
              <span>Total Estimated Price</span>
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

          {/* Checkboxes */}
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
              canPay && !processing ? "bg-white text-primary hover:brightness-105" : "bg-white/30 text-white/60 cursor-not-allowed"
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Assigning Driver & Processing...</span>
              </>
            ) : (
              <>
                Book Driver ({s.payMethod}) <ArrowRight className="h-4 w-4" />
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
                ✅ Chauffeur Assigned
              </span>
              <h3 className="text-xl font-bold tracking-tight text-foreground">Driver Booked Successfully!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your professional chauffeur has been assigned for your vehicle.</p>
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
                <span className="text-muted-foreground font-medium">Estimated Price</span>
                <span className="font-bold text-emerald-600 text-sm">{txnDetails.amount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Service Type</span>
                <span className="font-semibold text-foreground">{s.serviceType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Driver Assigned
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
  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
      <h3 className="text-lg font-semibold">Chauffeur Booking Summary</h3>
      <div className="mt-4 space-y-3 text-sm">
        <SummaryRow k="Service" v={s.serviceType} dot="primary" />
        <SummaryRow k="Pickup" v={s.pickup || "Not selected"} dot="primary" />
        <SummaryRow k="Destination" v={s.drop || "Optional (As per direction)"} dot="secondary" />
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <Meta k="Transmission" v={s.transmission} />
          <Meta k="Duration" v={s.duration} />
          <Meta k="Schedule" v={s.timing === "now" ? "Immediate Pickup" : `${s.date} · ${s.time}`} />
          <Meta k="Distance" v={s.tripMetrics ? `${s.tripMetrics.distanceKm} km` : "—"} />
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
  const { user } = useAuthUser();
  const [bookingId, setBookingId] = useState<string>(
    () => "DAL" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + String(Math.floor(1000 + Math.random() * 9000))
  );

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!s.pickupCoords || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    let cancelled = false;
    createBooking({
      data: {
        customerId: user?.id,
        customerEmail: user?.email,
        customerName: user?.name,
        customerPhone: user?.phone,
        serviceType: s.serviceType,
        pickup: { lat: s.pickupCoords.lat, lng: s.pickupCoords.lng, address: s.pickup || "Pickup Location" },
        drop: s.dropCoords ? { lat: s.dropCoords.lat, lng: s.dropCoords.lng, address: s.drop } : undefined,
        bookingDate: s.date,
        bookingTime: s.time,
        duration: s.duration,
        transmission: s.transmission,
        specialInstructions: s.specialInstructions,
        distanceKm: s.tripMetrics?.distanceKm || 0,
        durationMinutes: s.tripMetrics?.durationMinutes || 60,
        durationInTrafficMinutes: s.tripMetrics?.durationInTrafficMinutes ?? undefined,
        etaTime: s.tripMetrics?.etaTime ?? new Date().toISOString(),
        routePolyline: s.tripMetrics?.routePolyline ?? "",
        paymentMethod: s.payMethod,
        fare: s.tripMetrics?.fare || {
          baseFare: CHAUFFEUR_SERVICES[s.serviceType]?.baseFare || 299,
          ratePerKm: 13,
          ratePerHour: 120,
          distanceCharge: 0,
          timeCharge: 0,
          totalFare: 797,
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
        <h2 className="mt-6 text-3xl font-semibold tracking-tight">Chauffeur Driver Assigned</h2>
        <p className="mt-1 text-sm text-muted-foreground">Booking ID · <span className="font-semibold text-foreground">{bookingId}</span></p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        {/* Driver Details Card */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">RK</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Rajesh Kumar</h3>
              <p className="text-xs text-primary font-medium">Professional Chauffeur</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> 4.98 · 8+ yrs driving experience
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Meta k="Service Type" v={s.serviceType} />
            <Meta k="Duration" v={s.duration} />
            <Meta k="Driver Status" v="En Route to Pickup" />
            <Meta k="Phone" v="+91 98765 43210" />
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

        {/* Live Trip Info */}
        <div className="lg:col-span-3 overflow-hidden rounded-3xl border border-border bg-subtle shadow-soft flex flex-col justify-between">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-3">Booking Confirmation Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Pickup Address</span>
                <p className="font-medium text-foreground">{s.pickup || "Pickup Location"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Destination</span>
                <p className="font-medium text-foreground">{s.drop || "Flexible / Hourly Route"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Booking Date & Time</span>
                <p className="font-medium text-foreground">{s.timing === "now" ? "Immediate" : `${s.date} at ${s.time}`}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Transmission</span>
                <p className="font-medium text-foreground capitalize">{s.transmission} Transmission</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-background text-center text-sm">
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Service</div>
              <div className="mt-1 font-semibold truncate">{s.serviceType}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Duration</div>
              <div className="mt-1 font-semibold">{s.duration}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estimated Fare</div>
              <div className="mt-1 font-semibold text-primary">
                {s.tripMetrics ? formatCurrency(s.tripMetrics.fare.totalFare) : "₹797"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
          <Navigation className="h-4 w-4" /> Go to Customer Dashboard
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
          <Home className="h-4 w-4" /> Back Home
        </Link>
      </div>
    </div>
  );
}
