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
      <Testimonials />
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
    <section className="py-4">
      <div className="container-px mx-auto max-w-4xl">
        <QuickBook />
      </div>
    </section>
  );
}

function QuickBook() {
  const [tab, setTab] = useState<"hourly" | "oneway" | "outstation">("hourly");

  return (
    <div className="relative rounded-3xl border border-border/80 bg-background/95 p-5 shadow-card md:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Request Your Chauffeur</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select service and enter pickup details</p>
        </div>
        <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-semibold text-primary">
          Transparent Pricing
        </span>
      </div>

      <div className="mt-4 flex rounded-2xl bg-muted/80 p-1 text-sm">
        {(["hourly", "oneway", "outstation"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all duration-200 ${
              tab === t ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "hourly" ? "Hourly" : t === "oneway" ? "One-Way" : "Outstation"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Field icon={<span className="h-2.5 w-2.5 rounded-full bg-primary" />} label="Pickup Location" value="Enter pickup location..." />
        <Field
          icon={<span className="h-2.5 w-2.5 rounded-sm bg-secondary" />}
          label="Destination"
          value={tab === "hourly" ? "Optional (Decided on the go)" : "Enter destination address..."}
          muted={tab === "hourly"}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration" value={tab === "hourly" ? "4 Hours" : "As per trip"} small />
          <Field label="Schedule" value="Immediate Pickup" small />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-subtle p-4 border border-border/50">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Pricing Standard</div>
          <div className="text-xs font-bold text-foreground mt-1">
            Price calculated after trip details
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground font-medium">
          <div className="text-primary font-semibold">Verified Chauffeur</div>
          <div>Automatic & Manual</div>
        </div>
      </div>

      <Link
        to="/book"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-110 active:scale-98"
      >
        <span>Request Booking</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" />Background Verified</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />24/7 Customer Support</span>
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
    <section className="py-12 md:py-16">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Why Choose Us</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            Designed for Car Owners Who Expect Excellence.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed md:text-base">
            Engineered so you get total peace of mind, professional driving precision, and seamless convenience.
          </p>
        </div>

        {/* Asymmetric handcrafted layout */}
        <div className="mt-10 grid gap-5 md:grid-cols-12">
          {/* Main Featured Highlight */}
          <div className="reveal md:col-span-7 rounded-3xl border border-border/80 bg-background p-8 shadow-card flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="inline-block rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 text-xs font-bold mb-3">
                100% Verified Chauffeurs
              </span>
              <h3 className="text-xl font-bold text-foreground md:text-2xl">
                Background-Verified & Police-Checked Chauffeurs
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every driver undergoes comprehensive police background checks, driving test evaluations, and customer care etiquette training before handling your car.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-border/60 pt-4 text-xs font-semibold text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Full identity verification & driving skill certified</span>
            </div>
          </div>

          {/* Secondary Highlight Cards */}
          <div className="reveal md:col-span-5 grid gap-5">
            <div className="rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Automatic & Manual Transmission Experts</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Certified drivers experienced in handling luxury automatics, dual-clutch, and manual stick-shift vehicles.
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Transparent Rates & Zero Surge Pricing</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Fair hourly packages with clear pricing. No hidden fees or unexpected surge multipliers.
              </p>
            </div>
          </div>

          {/* Bottom complementary row */}
          <div className="reveal md:col-span-4 rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Drive in Your Personal Car</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Enjoy maximum comfort in your familiar vehicle while our professional chauffeur takes the wheel.
            </p>
          </div>

          <div className="reveal md:col-span-4 rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">On-Demand & Scheduled</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Book immediate driver pickup within 15-20 minutes or schedule in advance for intercity trips.
            </p>
          </div>

          <div className="reveal md:col-span-4 rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/40">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Navigation className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Live Driver Tracking & Support</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Track your driver's real-time location with instant status updates and dedicated support.
            </p>
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
    { n: "01", t: "Choose Service", d: "Select One-Way, Hourly, Airport or Outstation." },
    { n: "02", t: "Pickup Address", d: "Search your address (destination optional for hourly)." },
    { n: "03", t: "Date & Time", d: "Request immediate dispatch or schedule for later." },
    { n: "04", t: "Set Duration", d: "Select required duration (1h, 2h, 4h, 8h, or Full Day)." },
    { n: "05", t: "Confirm Booking", d: "Review fare breakdown and confirm payment method." },
    { n: "06", t: "Driver Arrives", d: "Verified chauffeur arrives at your location to drive your car." },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            Book Your Chauffeur in 6 Easy Steps.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="reveal rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-200 hover:border-primary/40"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary mb-4">
                {s.n}
              </div>
              <h3 className="text-base font-bold text-foreground">{s.t}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChauffeurPledge() {
  return (
    <section className="bg-subtle/70 py-16 md:py-24 border-y border-border/60">
      <div className="container-px mx-auto max-w-7xl">
        <div className="rounded-3xl border border-border/80 bg-background p-8 md:p-12 shadow-card grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
              Our Quality Assurance
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Certified Chauffeurs Trained for Premium Care.
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
              Whether you drive a manual hatchback, a luxury automatic sedan, or a 7-seater SUV, our verified chauffeurs handle your vehicle with extreme care and precision.
            </p>
            <div className="space-y-2.5 pt-2 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Rigorous driving skills & handling evaluation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Criminal background verification & identity checks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Uniformed, polite, and punctual professionals</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-subtle p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground">5-Star Service Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your assigned driver does not arrive on time or meet our service standards, we guarantee an immediate replacement driver and trip credit.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-110"
            >
              <span>Book a Chauffeur Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      name: "Anand Verma",
      role: "Software Architect",
      text: "Hired an hourly chauffeur for my weekend shopping trip. The driver handled my automatic SUV smoothly in traffic. Fantastic service!",
    },
    {
      name: "Priya Sharma",
      role: "Business Owner",
      text: "We use Driv A Long outstation drivers whenever we travel in our car. Always punctual, safe driving, and background verified.",
    },
    {
      name: "Vikram Mehta",
      role: "Corporate Executive",
      text: "Designated driver service is a lifesaver after late weekend dinners. Polite driver, clean uniform, and drove us safely home.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Customer Stories</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            Trusted by Car Owners Everywhere.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="reveal rounded-3xl border border-border/80 bg-background p-6 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-secondary">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-secondary" />
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground font-medium">"{r.text}"</p>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="font-bold text-xs text-foreground">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">{r.role}</div>
              </div>
            </div>
          ))}
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
      a: "No. Driv A Long Private Limited is a chauffeur rental platform. We provide background-verified, professional drivers to drive your personal or company car.",
    },
    {
      q: "Can I hire a driver for manual or automatic cars?",
      a: "Yes! All our chauffeurs are experienced and certified to drive both manual stick-shift and automatic transmission vehicles.",
    },
    {
      q: "Is a destination address mandatory for hourly bookings?",
      a: "No. For hourly and full-day chauffeur rentals, destination is completely optional. You can direct the chauffeur as you travel.",
    },
    {
      q: "How are driver rates calculated?",
      a: "Rates are based on the selected service type, duration (hours), and optional distance for outstation/one-way trips. All rates are shown with complete transparency before booking.",
    },
  ];

  return (
    <section className="bg-subtle/70 py-16 md:py-24 border-y border-border/60">
      <div className="container-px mx-auto max-w-4xl">
        <div className="reveal text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Frequently Asked Questions</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything You Need to Know.
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="reveal rounded-2xl border border-border/80 bg-background shadow-soft transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-primary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40 mt-1 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
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
