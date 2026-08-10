import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  Star,
  Sparkles,
  UserCheck,
  Award,
  CheckCircle2,
  ChevronDown,
  Zap,
  Wallet,
  Navigation,
  Building2,
  PartyPopper,
  Plane,
  Compass,
  Phone,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Driv A Long Private Limited — Hire a Professional Chauffeur for Your Car" },
      { name: "description", content: "Your Driver, Your Car. Book background-verified professional drivers on demand from Driv A Long Private Limited." },
      { property: "og:title", content: "Driv A Long Private Limited — Professional Chauffeurs, Your Own Vehicle" },
      { property: "og:description", content: "Verified professional drivers on demand. Hire chauffeurs for your car anytime." },
    ],
  }),
  component: HomePage,
});

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>(".reveal") ?? [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function HomePage() {
  const ref = useReveal();
  return (
    <div ref={ref} className="space-y-16 md:space-y-24">
      <Hero />
      <QuickBookSection />
      <WhyChooseUs />
      <Services />
      <HowItWorks />
      <ChauffeurPledge />
      <FAQ />
      <CTASection />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:pt-10 md:pb-16">
      <div className="container-px mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-12 items-center">
        {/* Left Column matching screenshot */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-subtle px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span>YOUR DRIVER · YOUR CAR</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Professional <br />
            chauffeurs <br />
            <span className="text-primary">for the car you</span> <br />
            already own.
          </h1>

          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground md:text-sm font-medium">
            Driv A Long provides background-verified, trained chauffeurs who drive your personal or corporate vehicle — hourly rentals, airport transfers, outstation journeys and event duty, booked in under a minute.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <Link
              to="/book"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-lift transition-all duration-200 hover:brightness-110 active:scale-98"
            >
              <span>Book a Chauffeur</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+917306605416"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/90 bg-background px-5 py-3.5 text-xs font-bold text-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary shadow-soft"
            >
              <Phone className="h-4 w-4 text-primary" />
              <span>+91 7306605416</span>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60">
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground">Verified</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Police-checked chauffeurs</div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground">24 / 7</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">On-demand dispatch</div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-foreground">Fixed</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">Transparent pricing</div>
            </div>
          </div>
        </div>

        {/* Right Column with Chauffeur Image & Floating Verification Badge */}
        <div className="relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-lift group">
            <img
              src="/hero-chauffeur.jpg"
              alt="Professional Driv A Long Chauffeur opening luxury car door"
              className="w-full h-[480px] sm:h-[540px] md:h-[580px] object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Floating Glassmorphic Overlay Badge */}
            <div className="absolute bottom-5 left-5 right-5 sm:left-8 sm:right-8 rounded-2xl border border-white/40 bg-white/90 p-4 backdrop-blur-xl shadow-lift flex items-center gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Every chauffeur verified</div>
                <div className="text-[11px] text-slate-600 font-medium">Identity, licence & background checked</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickBookSection() {
  return (
    <section className="py-6 md:py-10">
      <div className="container-px mx-auto max-w-7xl">
        <QuickBook />
      </div>
      <TrustBanner />
    </section>
  );
}

function QuickBook() {
  const [tab, setTab] = useState<"hourly" | "oneway" | "outstation">("hourly");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("4 Hours");
  const [schedule, setSchedule] = useState("Immediate");

  return (
    <div className="relative rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E5AE8] via-[#1E5AE8] to-[#F4B400]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1E5AE8]">
            QUICK BOOKING
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#0B2D7A] tracking-tight">
            Request your chauffeur
          </h2>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F4B400] bg-[#FFFDF5] px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4B400]" />
            No surge · Transparent fare
          </span>
        </div>
      </div>

      {/* Service Selector */}
      <div className="mt-6">
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 p-1.5 border border-slate-200/60 shadow-inner">
          {(["hourly", "oneway", "outstation"] as const).map((t) => {
            const isActive = tab === t;
            const label = t === "hourly" ? "Hourly" : t === "oneway" ? "One-Way" : "Outstation";
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-[#1E5AE8] shadow-md shadow-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Fields Horizontal Row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Pickup Location (occupies most width) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#1E5AE8] focus-within:border-[#1E5AE8] focus-within:ring-2 focus-within:ring-[#1E5AE8]/20 flex items-center gap-3.5 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-[#1E5AE8] shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              PICKUP LOCATION
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup location..."
              className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Destination */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#1E5AE8] focus-within:border-[#1E5AE8] focus-within:ring-2 focus-within:ring-[#1E5AE8]/20 flex items-center gap-3.5 shadow-sm">
          <span className="h-3 w-3 rounded-full bg-[#F4B400] shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              DESTINATION
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={tab === "hourly" ? "Optional — decided on the go" : "Enter destination address..."}
              className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#1E5AE8] focus-within:border-[#1E5AE8] flex items-center gap-3 shadow-sm">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              DURATION
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none cursor-pointer"
            >
              <option value="2 Hours">2 hours</option>
              <option value="4 Hours">4 hours</option>
              <option value="8 Hours">8 hours</option>
              <option value="Full Day">Full Day (12 hrs)</option>
            </select>
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#1E5AE8] focus-within:border-[#1E5AE8] flex items-center gap-3 shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              SCHEDULE
            </label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 outline-none cursor-pointer"
            >
              <option value="Immediate">Immediate</option>
              <option value="In 30 Mins">In 30 mins</option>
              <option value="Scheduled">Schedule date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side Trust Indicators */}
        <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1E5AE8]" />
            Background verified
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#1E5AE8]" />
            24/7 support
          </span>
          <span className="inline-flex items-center gap-2">
            <Award className="h-4 w-4 text-[#1E5AE8]" />
            Manual & automatic
          </span>
        </div>

        {/* Right Side Primary CTA Button */}
        <Link
          to="/book"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1E5AE8] hover:bg-[#1546bd] text-white px-8 py-3.5 text-xs sm:text-sm font-bold shadow-lift hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer"
        >
          <span>Continue booking</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function TrustBanner() {
  const items = [
    "Safe & Reliable Service",
    "Professional Drivers",
    "Flexible Booking",
    "Corporate Travel",
    "Airport Transfers",
    "Outstation Trips",
    "Event Chauffeurs",
    "Background Verified Chauffeurs",
  ];

  return (
    <div className="group relative mt-10 w-full overflow-hidden border-y border-slate-200/80 bg-white py-4 shadow-sm select-none">
      {/* Subtle Side Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-white to-transparent md:w-28" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-white to-transparent md:w-28" />

      {/* Infinite Auto-Scrolling Track */}
      <div className="flex w-max items-center animate-marquee">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-6 sm:px-10 text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap transition-colors duration-200 hover:text-[#1E5AE8]"
          >
            <CheckCircle2 className="h-4 w-4 text-[#F4B400] shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ icon, label, value, muted, small }: { icon?: React.ReactNode; label: string; value: string; muted?: boolean; small?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-border/80 bg-background ${small ? "px-3.5 py-2.5" : "px-4 py-3"} transition-colors hover:border-primary/50`}>
      {icon && <div className="grid h-5 w-5 place-items-center shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`truncate text-xs font-semibold ${muted ? "text-muted-foreground/70" : "text-foreground"}`}>{value}</div>
      </div>
    </div>
  );
}

function WhyChooseUs() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* Left Column with Executive Car Seat Image */}
          <div className="relative lg:col-span-6">
            <div className="relative overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-lift group">
              <img
                src="/why-choose-us.jpg"
                alt="Executive riding comfortably in luxury car backseat working on laptop"
                className="w-full h-[420px] sm:h-[500px] md:h-[540px] object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />
            </div>
          </div>

          {/* Right Column with Headline, Subheading, and 4 Feature List Items */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1E5AE8]">
                WHY CHOOSE US
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2D7A] tracking-tight leading-[1.15]">
                Built for owners who expect quiet excellence.
              </h2>
              <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                You keep the comfort of your own car. We bring the discipline, discretion and driving standards of a premium chauffeur service.
              </p>
            </div>

            {/* 4 Stacked Feature List Items */}
            <div className="space-y-6 pt-2">
              {/* Item 1 */}
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EBF1FF] text-[#1E5AE8]">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2D7A]">
                    Police-verified chauffeurs
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Identity, licence and criminal background checks before any driver takes your wheel.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EBF1FF] text-[#1E5AE8]">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2D7A]">
                    Manual & automatic experts
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Trained on hatchbacks, luxury automatics, dual-clutch sedans and 7-seater SUVs.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EBF1FF] text-[#1E5AE8]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2D7A]">
                    Transparent, zero-surge fares
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Clear hourly packages. What you see before booking is what you pay after the trip.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EBF1FF] text-[#1E5AE8]">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2D7A]">
                    Live tracking & support
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Follow your chauffeur in real time with a dedicated support line for every booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { title: "One-Way Chauffeur", desc: "Point A to B driving service for your personal car.", price: "From ₹299", icon: Compass },
    { title: "Hourly Chauffeur", desc: "Flexible hourly driver for shopping & errands.", price: "From ₹349", icon: Clock },
    { title: "Full-Day Chauffeur", desc: "Dedicated driver for 8 to 24 hours.", price: "From ₹1,499", icon: Award },
    { title: "Airport Chauffeur", desc: "Punctual airport pickup/drop in your vehicle.", price: "From ₹499", icon: Plane },
    { title: "Designated Driver", desc: "Safe drive home after parties & nightlife.", price: "From ₹399", icon: Shield },
    { title: "Corporate Chauffeur", desc: "Executive drivers for business meetings.", price: "From ₹799", icon: Building2 },
    { title: "Event Chauffeur", desc: "Weddings and special family functions.", price: "From ₹699", icon: PartyPopper },
    { title: "Outstation Chauffeur", desc: "Experienced highway driver for intercity trips.", price: "From ₹999", icon: Navigation },
  ];

  return (
    <section className="bg-subtle/70 py-16 md:py-24 border-y border-border/60">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 reveal">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Chauffeur Services</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              Chauffeur Services Tailored to Every Need.
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
          >
            <span>View All Chauffeur Services</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="reveal group rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground mb-5">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-xs font-bold text-primary">{s.price}</span>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:text-primary transition-colors"
                >
                  <span>Book</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Choose your service", d: "One-way, hourly, airport or outstation." },
    { n: "02", t: "Share pickup details", d: "Destination stays optional for hourly bookings." },
    { n: "03", t: "Pick date & time", d: "Immediate dispatch or schedule in advance." },
    { n: "04", t: "Confirm the fare", d: "Review a clear breakdown before you commit." },
    { n: "05", t: "Chauffeur arrives", d: "A verified driver reaches you, uniformed and ready." },
    { n: "06", t: "Travel & rate", d: "Sit back in your own car and rate the drive." },
  ];

  return (
    <section className="py-12 md:py-20 bg-[#051747] text-white">
      <div className="container-px mx-auto max-w-7xl">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F4B400]">
            HOW IT WORKS
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Six calm steps from request to <br className="hidden sm:inline" />
            road.
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-blue-400/20 bg-[#0B2D7A]/60 backdrop-blur-xl shadow-lift">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-400/20">
            {steps.slice(0, 3).map((s, i) => (
              <div key={i} className="p-8 sm:p-10 space-y-3">
                <span className="text-sm font-extrabold text-[#F4B400] block">{s.n}</span>
                <h3 className="text-xl font-bold text-white tracking-tight">{s.t}</h3>
                <p className="text-xs sm:text-sm text-blue-100/70 font-normal leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-400/20 border-t border-blue-400/20">
            {steps.slice(3, 6).map((s, i) => (
              <div key={i} className="p-8 sm:p-10 space-y-3">
                <span className="text-sm font-extrabold text-[#F4B400] block">{s.n}</span>
                <h3 className="text-xl font-bold text-white tracking-tight">{s.t}</h3>
                <p className="text-xs sm:text-sm text-blue-100/70 font-normal leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChauffeurPledge() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-center">
          {/* Left Column with Header, Checklist & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1E5AE8]">
                SAFETY & ASSURANCE
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2D7A] tracking-tight leading-[1.15]">
                Trained, uniformed <br />
                and accountable.
              </h2>
              <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                Whether you drive a manual hatchback or a luxury automatic, every chauffeur is evaluated on handling, etiquette and punctuality before a single assignment.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#1E5AE8] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0B2D7A]">
                  Rigorous driving-skill and handling evaluation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#1E5AE8] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0B2D7A]">
                  Criminal background and identity verification
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#1E5AE8] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0B2D7A]">
                  Uniformed, courteous and punctual professionals
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-[#1E5AE8] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0B2D7A]">
                  Replacement chauffeur guarantee on service lapses
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1E5AE8] hover:bg-[#1546bd] text-white px-7 py-3.5 text-xs sm:text-sm font-bold shadow-lift hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <span>Book a verified chauffeur</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column with Airport Arrival Chauffeur Image */}
          <div className="relative lg:col-span-6">
            <div className="relative overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-lift group">
              <img
                src="/safety-assurance.jpg"
                alt="Uniformed Driv A Long chauffeur opening door for executive client outside airport terminal"
                className="w-full h-[420px] sm:h-[480px] md:h-[520px] object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Driv A Long provide cars?",
      a: "No. Driv A Long Private Limited is a chauffeur service. We provide background-verified professional drivers who drive your personal or company car.",
    },
    {
      q: "Can I hire a driver for a manual or automatic car?",
      a: "Yes! Our chauffeurs are certified and experienced in driving manual stick-shift cars, luxury automatics, dual-clutch sedans, and 7-seater SUVs.",
    },
    {
      q: "Is a destination mandatory for hourly bookings?",
      a: "No. For hourly and full-day chauffeur rentals, destination is completely optional. You can direct your chauffeur on the go as per your schedule.",
    },
    {
      q: "How are chauffeur rates calculated?",
      a: "We offer transparent pricing based on the chosen service duration or distance package. What you see before booking is what you pay after the trip.",
    },
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Left Column matching reference screenshot */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1E5AE8]">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2D7A] tracking-tight leading-[1.15]">
              Everything you need <br />
              to know.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
              Still unsure about something? Our team answers on WhatsApp within minutes.
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/917306605416"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white hover:border-[#1E5AE8] text-[#0B2D7A] hover:text-[#1E5AE8] px-7 py-3 text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span>Talk to our team</span>
              </a>
            </div>
          </div>

          {/* Right Column Accordion matching reference screenshot */}
          <div className="lg:col-span-7 divide-y divide-slate-100 border-y border-slate-100">
            {faqs.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="py-5 transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left text-base sm:text-lg font-bold text-[#0B2D7A] group cursor-pointer"
                  >
                    <span className="pr-4 group-hover:text-[#1E5AE8] transition-colors">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#1E5AE8] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-px mx-auto max-w-5xl">
        <div className="rounded-3xl border border-[#1E4193] bg-[#0B2D7A] p-8 md:p-14 text-center text-white shadow-lift relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#1E5AE8]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-[#F4B400]/15 blur-3xl pointer-events-none" />

          <span className="inline-block rounded-full bg-[#F4B400]/15 text-[#F4B400] border border-[#F4B400]/30 px-3.5 py-1 text-xs font-bold mb-4">
            Official Chauffeur Partner
          </span>

          <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl text-white">
            Ready to Hire Your Personal Chauffeur?
          </h2>
          <p className="mt-3 text-xs md:text-sm text-blue-100/90 max-w-xl mx-auto leading-relaxed">
            Book background-verified professional drivers for your car in under 60 seconds with Driv A Long Private Limited.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F4B400] px-6 py-3.5 text-xs font-bold text-[#0B2D7A] shadow-soft transition-all duration-200 hover:bg-[#E5A800] hover:scale-102 active:scale-98"
            >
              <span>Book a Driver Now</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#0B2D7A]" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5AE8] px-6 py-3.5 text-xs font-bold text-white transition-all duration-200 hover:bg-[#184CC6]"
            >
              <span>Explore Services</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
