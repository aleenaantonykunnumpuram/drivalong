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

const STEPS = ["Service", "Pickup", "Schedule", "Duration", "Review & Book", "Confirmed"];

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
          Review & Book <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 2.159.685 4.158 1.854 5.795L2.5 21.5l3.829-1.326A9.952 9.952 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zM4 12a8 8 0 1114.93 4.005.996.996 0 01.129.539l.608 2.433-2.433-.608a.996.996 0 01-.539-.129A8 8 0 014 12z"/>
    </svg>
  );
}

/* ------------------------ Step 5 · Review & WhatsApp Booking ------------------------ */

function StepPayment({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const { user } = useAuthUser();
  const [custName, setCustName] = useState(user?.name || "");
  const [custPhone, setCustPhone] = useState(user?.phone || "");
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");

  const serviceDetails = CHAUFFEUR_SERVICES[s.serviceType] || CHAUFFEUR_SERVICES["Hourly Chauffeur"];
  const durationHours = DURATION_HOURS[s.duration] || 4;

  const fare = s.tripMetrics?.fare;
  const totalAmountNum = fare ? fare.totalFare : serviceDetails.baseFare + durationHours * serviceDetails.ratePerHour;
  const totalAmountStr = formatCurrency(totalAmountNum);

  const handleBookViaWhatsApp = () => {
    setValidationError("");

    if (!custName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }
    if (!custPhone.trim()) {
      setValidationError("Please enter your phone number.");
      return;
    }
    if (!s.pickup.trim()) {
      setValidationError("Please enter your pickup location.");
      return;
    }
    if (!termsAgreed) {
      setValidationError("Please agree to the Terms & Conditions.");
      return;
    }

    setProcessing(true);

    const scheduleStr = s.timing === "now" ? "Immediate Pickup (As soon as possible)" : `${s.date} at ${s.time}`;
    const distanceStr = s.tripMetrics?.distanceKm ? `${s.tripMetrics.distanceKm} km` : "As per route";
    const fareStr = totalAmountStr || "To be confirmed";

    const whatsappMessage = `Hello Driv A Long,

I would like to book a chauffeur.

Booking Details

👤 Name:
${custName.trim()}

📞 Phone:
${custPhone.trim()}

🚗 Service:
${s.serviceType}

📍 Pickup Location:
${s.pickup}

📍 Destination:
${s.drop || "Flexible / Hourly Route"}

🕒 Schedule:
${scheduleStr}

⏳ Duration:
${s.duration}

🚘 Vehicle Transmission:
${s.transmission === "automatic" ? "Automatic" : "Manual"}

📏 Estimated Distance:
${distanceStr}

💰 Estimated Fare:
${fareStr}

Please confirm my booking and contact me.

Thank you.`;

    const whatsappUrl = `https://wa.me/917306605416?text=${encodeURIComponent(whatsappMessage)}`;

    // Save booking state for customer record
    createBooking({
      data: {
        customerId: user?.id,
        customerEmail: user?.email,
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        serviceType: s.serviceType,
        pickup: { lat: s.pickupCoords?.lat || 9.9312, lng: s.pickupCoords?.lng || 76.2673, address: s.pickup },
        drop: s.dropCoords ? { lat: s.dropCoords.lat, lng: s.dropCoords.lng, address: s.drop } : undefined,
        bookingDate: s.date,
        bookingTime: s.time,
        duration: s.duration,
        transmission: s.transmission,
        specialInstructions: s.specialInstructions,
        distanceKm: s.tripMetrics?.distanceKm || 0,
        durationMinutes: s.tripMetrics?.durationMinutes || 60,
        paymentMethod: "WhatsApp",
        fare: fare || {
          baseFare: serviceDetails.baseFare,
          ratePerKm: 13,
          ratePerHour: serviceDetails.ratePerHour,
          distanceCharge: 0,
          timeCharge: 0,
          totalFare: totalAmountNum,
        },
      },
    })
      .catch((err) => console.error("Error logging WhatsApp booking:", err))
      .finally(() => {
        setProcessing(false);
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        onNext();
      });
  };

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-5 relative">
      <div className="lg:col-span-3 space-y-5">
        <SummaryCard s={s} />

        {/* Customer Details Form */}
        <div className="rounded-3xl border border-border/80 bg-background p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Contact & Booking Confirmation</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
              <WhatsAppIcon className="h-3.5 w-3.5" /> No Online Payment Required
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter your details below to send your pre-filled booking request directly to our team on WhatsApp (**+91 7306605416**).
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">Your Full Name *</label>
              <input
                type="text"
                required
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-xs outline-none transition-all duration-200 focus:border-primary focus:shadow-ring placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Phone Number *</label>
              <input
                type="tel"
                required
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-xs outline-none transition-all duration-200 focus:border-primary focus:shadow-ring placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {validationError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-3xl border border-[#1E4193] bg-[#0B2D7A] p-6 text-white shadow-lift lg:col-span-2 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Estimated Fare</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-[#F4B400]" /> Verified Service
            </span>
          </div>

          <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">{totalAmountStr}</div>

          {/* Fare Breakdown */}
          <div className="mt-4 rounded-2xl bg-white/10 p-3.5 backdrop-blur text-xs space-y-2 text-blue-100/90 border border-white/10">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200 border-b border-white/10 pb-1.5 flex justify-between">
              <span>Fare Standard</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between">
              <span>Base Service Fee</span>
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
            <div className="flex justify-between border-t border-white/15 pt-2 text-xs font-bold text-white">
              <span>Total Estimated Fare</span>
              <span className="text-[#F4B400]">{totalAmountStr}</span>
            </div>
          </div>

          {/* WhatsApp Direct Notice */}
          <div className="mt-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 p-3.5 text-xs text-white space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-[#25D366]">
              <WhatsAppIcon className="h-4 w-4" /> Direct WhatsApp Booking
            </div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              No payment is required right now. Your details will be pre-filled in WhatsApp so you can send your request directly to **+91 7306605416**.
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="mt-4 space-y-2 text-xs">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-primary accent-[#F4B400] cursor-pointer"
              />
              <span className="text-[11px] text-blue-100/90">I agree to the Terms & Cancellation Policy</span>
            </label>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleBookViaWhatsApp}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 text-xs font-bold shadow-lift transition-all duration-200 active:scale-98 cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Opening WhatsApp...</span>
              </>
            ) : (
              <>
                <WhatsAppIcon className="h-4.5 w-4.5" />
                <span>Book via WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={processing}
            className="mt-2.5 w-full rounded-2xl py-2 text-xs font-semibold text-blue-200 hover:text-white transition disabled:opacity-50"
          >
            Back to Duration
          </button>
        </div>
      </aside>
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
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" /> Background Verified Chauffeur
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
