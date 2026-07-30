import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Clock, MapPin, Star, Sparkles, UserCheck, Award, CheckCircle2, ChevronDown, Zap, Wallet, Navigation, Building2, PartyPopper, Plane, Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Driv A Long — Hire a Professional Chauffeur for Your Car" },
      { name: "description", content: "Your Driver, Your Car. Book background-verified professional drivers on demand for hourly, airport, outstation, or event travel." },
      { property: "og:title", content: "Driv A Long — Professional Chauffeurs, Your Own Vehicle" },
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
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function HomePage() {
  const ref = useReveal();
  return (
    <div ref={ref}>
      <Hero />
      <TrustBar />
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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />

      <div className="container-px mx-auto grid max-w-7xl gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Your Driver, Your Car · Professional Drivers on Demand
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[64px]">
            Hire a Professional<br />
            <span className="text-gradient-primary">Chauffeur for Your Car.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Book verified, experienced chauffeurs to drive your personal or corporate vehicle. Flexible hourly rentals, outstation trips, airport pickup, and event drivers — anytime, anywhere.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/book" className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:brightness-110">
              Book Experienced Chauffeur
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-semibold hover:bg-muted">
              How It Works
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              { k: "50K+", v: "Hours Driven" },
              { k: "4.95★", v: "Chauffeur Rating" },
              { k: "1,500+", v: "Verified Drivers" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-border bg-background/60 p-4 backdrop-blur">
                <div className="text-2xl font-semibold tracking-tight">{s.k}</div>
                <div className="text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <QuickBook />
        </div>
      </div>
    </section>
  );
}

function QuickBook() {
  const [tab, setTab] = useState<"hourly" | "oneway" | "outstation">("hourly");
  return (
    <div className="relative rounded-3xl border border-border bg-background p-5 shadow-lift md:p-6">
      <div className="absolute -inset-1 -z-10 rounded-[28px] bg-gradient-to-br from-primary/20 via-transparent to-secondary/30 blur-2xl" />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Book Driver Instantly</h3>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-600">Your Driver, Your Car</span>
      </div>

      <div className="mt-4 inline-flex w-full rounded-2xl bg-muted p-1 text-sm">
        {(["hourly", "oneway", "outstation"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl px-3 py-2 font-medium capitalize transition ${tab === t ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}>
            {t === "hourly" ? "Hourly" : t === "oneway" ? "One-Way" : "Outstation"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Field icon={<span className="h-2.5 w-2.5 rounded-full bg-primary" />} label="Pickup Address" value="Search pickup location..." />
        <Field icon={<span className="h-2.5 w-2.5 rounded-sm bg-secondary" />} label="Destination" value={tab === "hourly" ? "Optional (Decided on the go)" : "Search destination address..."} muted={tab === "hourly"} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration" value={tab === "hourly" ? "4 Hours" : "As per trip"} small />
          <Field label="Schedule" value="Immediate Pickup" small />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-subtle p-4">
        <div>
          <div className="text-xs text-muted-foreground">Estimated price</div>
          <div className="text-2xl font-bold tracking-tight text-primary">₹ {tab === "outstation" ? "2,499" : tab === "hourly" ? "909" : "649"}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Verified Chauffeur</div>
          <div>Automatic & Manual</div>
        </div>
      </div>

      <Link to="/book" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
        Book Driver Now
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" />Background Verified</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Pickup in 15-20 min</span>
      </div>
    </div>
  );
}

function Field({ icon, label, value, muted, small }: { icon?: React.ReactNode; label: string; value: string; muted?: boolean; small?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-border ${small ? "px-3 py-2.5" : "px-4 py-3"} transition hover:border-primary/60`}>
      {icon && <div className="grid h-5 w-5 place-items-center">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`truncate text-sm font-medium ${muted ? "text-muted-foreground" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = ["Zomato Executives", "Swiggy Leaders", "Flipkart VPs", "Razorpay Founders", "Cred VIPs", "PhonePe Executives"];
  return (
    <section className="border-y border-border bg-subtle py-8">
      <div className="container-px mx-auto max-w-7xl">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Trusted by executives & car owners across India</p>
        <div className="mt-6 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-16 text-lg font-semibold text-muted-foreground/70">
            {[...items, ...items].map((x, i) => <span key={i} className="whitespace-nowrap">{x}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const items = [
    { icon: UserCheck, title: "Background-Verified Drivers", body: "100% police background-checked, trained, and top-rated chauffeurs for your peace of mind." },
    { icon: Clock, title: "On-Demand & Scheduled", body: "Hire a driver immediately in 15-20 minutes or schedule for business trips and events." },
    { icon: Wallet, title: "Transparent Hourly Billing", body: "Fair hourly packages with zero surge charges. Pay only for the chauffeur service you use." },
    { icon: Shield, title: "Drive In Your Own Car", body: "Enjoy maximum luxury and comfort in your familiar vehicle while our chauffeur drives." },
    { icon: Award, title: "Automatic & Manual Experts", body: "Every driver is certified to handle automatic, dual-clutch, and manual transmission cars." },
    { icon: Navigation, title: "Live Driver Tracking", body: "Track your assigned chauffeur en route to your pickup location with real-time ETA updates." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why Driv A Long</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Your Driver. Your Car. Total Peace of Mind.</h2>
          <p className="mt-3 text-muted-foreground">Professional chauffeur rental engineered so you arrive relaxed and safe in your own vehicle.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="reveal group rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { title: "One-Way Chauffeur", desc: "Point A to B driving service for your car.", price: "From ₹299", icon: Compass },
    { title: "Hourly Chauffeur", desc: "Flexible hourly driver for shopping & errands.", price: "From ₹349", icon: Clock },
    { title: "Full-Day Chauffeur", desc: "Dedicated driver for 8 to 24 hours.", price: "From ₹1,499", icon: Award },
    { title: "Airport Chauffeur", desc: "Punctual airport pickup/drop in your vehicle.", price: "From ₹499", icon: Plane },
    { title: "Designated Driver", desc: "Safe drive home after parties & nightlife.", price: "From ₹399", icon: Shield },
    { title: "Corporate Chauffeur", desc: "Executive drivers for business meetings.", price: "From ₹799", icon: Building2 },
    { title: "Event Chauffeur", desc: "Weddings and special family functions.", price: "From ₹699", icon: PartyPopper },
    { title: "Outstation Chauffeur", desc: "Experienced highway driver for intercity trips.", price: "From ₹999", icon: Navigation },
  ];
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Chauffeur Services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Chauffeur Services for Every Need.</h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View All Chauffeur Services <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div key={i} className="reveal group relative overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-lift">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition group-hover:bg-primary/10" />
              <s.icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{s.price}</span>
                <Link to="/book" className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">Book Driver <ArrowRight className="h-3.5 w-3.5" /></Link>
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
    { n: "01", t: "Choose a Chauffeur Service", d: "Select One-Way, Hourly, Full-Day, Airport or Outstation." },
    { n: "02", t: "Enter Pickup Details", d: "Provide your pickup location (destination optional)." },
    { n: "03", t: "Select Date & Time", d: "Choose immediate driver dispatch or schedule for later." },
    { n: "04", t: "Choose Duration", d: "Pick your required hours (1h, 2h, 4h, 8h, or Full Day)." },
    { n: "05", t: "Confirm Booking", d: "Review price breakdown and select payment method." },
    { n: "06", t: "Driver Assigned", d: "Driver arrives at your pickup location to drive your car." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Book Your Chauffeur in 6 Easy Steps.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="reveal relative rounded-3xl border border-border bg-background p-6 shadow-soft">
              <div className="text-3xl font-bold tracking-tight text-primary">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChauffeurPledge() {
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="rounded-3xl border border-border bg-background p-8 md:p-12 shadow-lift grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">Our Quality Standards</span>
            <h2 className="text-3xl font-bold tracking-tight">Experienced Drivers for Every Vehicle Type.</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Whether you drive a manual hatchback, a luxury automatic sedan, or a premium 7-seater SUV, our certified chauffeurs treat your car with utmost care and driving precision.
            </p>
            <div className="mt-6 space-y-3 text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Rigorous 50-point driving skills assessment</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Criminal background verification & drug checks</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Uniformed, polite, and punctual professionals</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-subtle p-6 space-y-4">
            <h3 className="font-semibold text-lg">Chauffeur Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your assigned driver does not arrive on time or meet our 5-star service standards, we guarantee a free replacement driver and full credit.
            </p>
            <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
              Book a Chauffeur Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Anand Verma", role: "Software Architect", text: "Hired an hourly chauffeur for my weekend shopping trip in Indiranagar. The driver drove my Automatic Harrier smoothly. Fantastic service!" },
    { name: "Priya Sharma", role: "Business Owner", text: "We use Driv A Long outstation drivers whenever we travel from Bangalore to Mysore in our own car. Professional and safe driving." },
    { name: "Vikram Mehta", role: "Corporate Executive", text: "Designated driver service is a lifesaver after late weekend dinners. Clean uniform, extremely polite, and drove my sedan safely back home." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Customer Stories</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Loved by car owners everywhere.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="reveal rounded-3xl border border-border bg-background p-6 shadow-soft">
              <div className="flex gap-1 text-secondary">
                {[...Array(5)].map((_, idx) => <Star key={idx} className="h-4 w-4 fill-secondary" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="font-semibold text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Does Driv A Long provide cars?", a: "No. Driv A Long is a chauffeur rental platform. We provide background-verified professional drivers to drive your own car." },
    { q: "Can I hire a driver for manual or automatic cars?", a: "Yes! All our chauffeurs are experienced and certified to drive both manual stick-shift and automatic transmission cars." },
    { q: "Is destination address mandatory for hourly bookings?", a: "No. For hourly and full-day chauffeur rentals, destination is completely optional. You can direct the chauffeur on the go." },
    { q: "How are driver rates calculated?", a: "Rates are based on selected service type, duration (hours), and optional distance for outstation/one-way trips. See transparent pricing before booking." },
  ];
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-4xl">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Frequently Asked Questions</h2>
        </div>
        <div className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-background p-6 shadow-soft space-y-2">
              <h3 className="font-semibold text-base">{f.q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-5xl">
        <div className="rounded-3xl border border-border bg-primary p-8 md:p-12 text-center text-primary-foreground shadow-lift">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Hire Your Personal Chauffeur?</h2>
          <p className="mt-3 text-sm text-primary-foreground/80 max-w-xl mx-auto">
            Book professional drivers on demand for your own car in under 60 seconds.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-soft hover:brightness-105">
              Book a Driver Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
