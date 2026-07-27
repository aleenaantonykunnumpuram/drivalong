import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin, Navigation, ArrowRight, ArrowLeft, Car, RouteIcon, Clock, Calendar,
  Users, Briefcase, Snowflake, Cog, CheckCircle2, CreditCard, Wallet, Banknote,
  Star, Phone, MessageSquare, Share2, Download, Home, Sparkles, Zap,
} from "lucide-react";
import { GoogleMapComponent } from "./maps/GoogleMapComponent";

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
  tripType: TripType;
  vehicle: Vehicle;
  transmission: Transmission;
  timing: Timing;
  date: string;
  time: string;
  pkg: Package;
  payMode: PayMode;
  payMethod: string;
}

const STEPS = ["Location", "Trip Type", "Vehicle", "Pricing", "Payment", "Confirmed"];

export function BookingWizard() {
  const [s, setS] = useState<State>({
    step: 0,
    pickup: "Indiranagar 100 Ft Road, Bengaluru",
    drop: "Kempegowda International Airport",
    tripType: "one-way",
    vehicle: "sedan",
    transmission: "automatic",
    timing: "now",
    date: new Date().toISOString().slice(0, 10),
    time: "18:30",
    pkg: "payg",
    payMode: "before",
    payMethod: "UPI",
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
        {s.step === 3 && <StepPricing s={s} set={set} onNext={next} onBack={back} />}
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
  return (
    <div className="animate-rise space-y-6">
      <GoogleMapComponent
        pickup={s.pickup}
        drop={s.drop}
        vehicleType={s.vehicle}
        onPickupChange={(v) => set("pickup", v)}
        onDropChange={(v) => set("drop", v)}
      />

      <div className="flex justify-end">
        <button onClick={onNext} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
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
    <div className="animate-rise space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VEHICLES.map((v) => {
          const active = s.vehicle === v.id;
          return (
            <button
              key={v.id}
              onClick={() => set("vehicle", v.id)}
              className={`group rounded-3xl border-2 p-5 text-left transition ${active ? "border-primary bg-primary/5 shadow-ring" : "border-border bg-background hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft"}`}
            >
              <div className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10">
                <Car className={`h-14 w-14 ${active ? "text-primary" : "text-foreground/70"} transition group-hover:scale-105`} strokeWidth={1.4} />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-base font-semibold">{v.name}</h3>
                <span className="text-sm font-semibold text-primary">₹{v.rate}/km</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                <Chip icon={<Users className="h-3 w-3" />}>{v.seats} seats</Chip>
                <Chip icon={<Briefcase className="h-3 w-3" />}>{v.luggage} bags</Chip>
                {v.ac && <Chip icon={<Snowflake className="h-3 w-3" />}>AC</Chip>}
                {v.auto && <Chip icon={<Cog className="h-3 w-3" />}>Auto</Chip>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 rounded-3xl border border-border bg-subtle p-6 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transmission</div>
          <div className="mt-3 flex gap-2">
            {(["automatic", "manual"] as const).map((t) => (
              <button key={t} onClick={() => set("transmission", t)}
                className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-medium capitalize transition ${s.transmission === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking time</div>
          <div className="mt-3 flex gap-2">
            {(["now", "later"] as const).map((t) => (
              <button key={t} onClick={() => set("timing", t)}
                className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-medium capitalize transition ${s.timing === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}>
                {t === "now" ? "Now" : "Schedule Later"}
              </button>
            ))}
          </div>
          {s.timing === "later" && (
            <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
              <div className="rounded-2xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Calendar className="h-3 w-3" /> Date</div>
                <input type="date" value={s.date} onChange={(e) => set("date", e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
              </div>
              <div className="rounded-2xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><Clock className="h-3 w-3" /> Time</div>
                <input type="time" value={s.time} onChange={(e) => set("time", e.target.value)} className="mt-1 w-full bg-transparent text-sm outline-none" />
              </div>
            </div>
          )}
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

const PACKAGES: { id: Package; title: string; price: number; km: number; recommended?: boolean }[] = [
  { id: "1h", title: "1 Hour", price: 299, km: 10 },
  { id: "2h", title: "2 Hours", price: 419, km: 20 },
  { id: "3h", title: "3 Hours", price: 539, km: 30 },
  { id: "4h", title: "4 Hours", price: 659, km: 40 },
];

function StepPricing({ s, set, onNext, onBack }: { s: State; set: <K extends keyof State>(k: K, v: State[K]) => void; onNext: () => void; onBack: () => void }) {
  const price = useMemo(() => {
    const base = s.pkg === "payg" ? 649 : PACKAGES.find((p) => p.id === s.pkg)!.price;
    const conv = 40;
    const gst = Math.round(base * 0.05);
    return { base, conv, gst, total: base + conv + gst };
  }, [s.pkg]);

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Hourly packages</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map((p) => {
              const active = s.pkg === p.id;
              return (
                <button key={p.id} onClick={() => set("pkg", p.id)} className={`rounded-2xl border-2 p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"}`}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.title}</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">₹{p.price}</div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Includes {p.km} km</div>
                  <div className="text-[11px] text-muted-foreground">Extra ₹5/km after</div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => set("pkg", "payg")} className={`relative flex w-full items-center gap-5 rounded-3xl border-2 p-5 text-left transition ${s.pkg === "payg" ? "border-primary bg-primary/5 shadow-ring" : "border-border bg-background hover:border-primary/50"}`}>
          <span className="absolute right-4 top-4 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink">Recommended</span>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold">Pay How Much You Go</h4>
            <p className="mt-1 text-sm text-muted-foreground">No hourly limits. Distance-based pricing at ₹{VEHICLES.find(v => v.id === s.vehicle)!.rate}/km.</p>
          </div>
        </button>
      </div>

      <aside className="rounded-3xl border border-border bg-subtle p-6">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Fare summary</h4>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row k="Driver charge" v={`₹${price.base}`} />
          <Row k="Convenience fee" v={`₹${price.conv}`} />
          <Row k="GST (5%)" v={`₹${price.gst}`} />
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm font-medium">Estimated total</span>
          <span className="text-3xl font-semibold tracking-tight text-primary">₹{price.total}</span>
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
  const beforeOptions = ["Stripe", "UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"];
  const afterOptions = ["Cash", "UPI"];
  const active = s.payMode === "before" ? beforeOptions : afterOptions;
  useEffect(() => { if (!active.includes(s.payMethod)) set("payMethod", active[0]); }, [s.payMode]);

  return (
    <div className="animate-rise grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-5">
        <SummaryCard s={s} />

        <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
          <h3 className="text-lg font-semibold">Payment</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["before", "after"] as const).map((m) => (
              <button key={m} onClick={() => set("payMode", m)}
                className={`rounded-2xl border-2 px-4 py-4 text-left transition ${s.payMode === m ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className={`h-3 w-3 rounded-full border-2 ${s.payMode === m ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  Pay {m === "before" ? "Before" : "After"} Trip
                </div>
                <p className="mt-1.5 pl-5 text-xs text-muted-foreground">{m === "before" ? "Card / UPI / Wallet" : "Cash or UPI on completion"}</p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Payment method</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {active.map((opt) => (
                <button key={opt} onClick={() => set("payMethod", opt)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${s.payMethod === opt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}>
                  {opt === "Cash" ? <Banknote className="h-4 w-4" /> : opt === "Wallet" ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-border bg-primary p-6 text-primary-foreground shadow-lift lg:col-span-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">Amount payable</div>
        <div className="mt-2 text-4xl font-semibold tracking-tight">₹729</div>
        <div className="mt-1 text-xs text-primary-foreground/80">Incl. driver fee + GST</div>
        <ul className="mt-5 space-y-2 text-sm text-primary-foreground/90">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Free cancellation for 5 min</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Trip insured up to ₹5 lakh</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 24/7 support</li>
        </ul>
        <button onClick={onNext} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-primary shadow-soft transition hover:brightness-105">
          Proceed to pay <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={onBack} className="mt-2 w-full rounded-2xl py-2.5 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground">Back</button>
      </aside>
    </div>
  );
}

function SummaryCard({ s }: { s: State }) {
  const v = VEHICLES.find((x) => x.id === s.vehicle)!;
  const tt = ({ "one-way": "One Side", round: "Round Trip", outstation: "Outstation", rental: "Daily Rental" } as Record<TripType, string>)[s.tripType];
  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-soft">
      <h3 className="text-lg font-semibold">Trip summary</h3>
      <div className="mt-4 space-y-3 text-sm">
        <SummaryRow k="Pickup" v={s.pickup} dot="primary" />
        <SummaryRow k="Drop" v={s.drop} dot="secondary" />
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <Meta k="Vehicle" v={v.name} />
          <Meta k="Trip Type" v={tt} />
          <Meta k="Schedule" v={s.timing === "now" ? "Now" : `${s.date} · ${s.time}`} />
          <Meta k="Distance" v="~ 34 km" />
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
  const bookingId = useMemo(() => "DAL" + Math.floor(100000 + Math.random() * 900000), []);
  const otp = useMemo(() => Math.floor(1000 + Math.random() * 9000).toString(), []);
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
              ETA · 8 min
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-background text-center text-sm">
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Distance</div>
              <div className="mt-1 font-semibold">34 km</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Duration</div>
              <div className="mt-1 font-semibold">48 min</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Fare</div>
              <div className="mt-1 font-semibold text-primary">₹ 729</div>
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
