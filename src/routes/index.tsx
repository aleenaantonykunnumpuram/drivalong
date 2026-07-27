import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Clock, MapPin, Star, Sparkles, Car, Users, Award, CheckCircle2, ChevronDown, Zap, Wallet, Route as RouteIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Driv A Long — Book a Professional Chauffeur in Minutes" },
      { name: "description", content: "Verified chauffeurs on demand. City rides, outstation, hourly rentals and round trips. Transparent pricing and real-time tracking." },
      { property: "og:title", content: "Driv A Long — Professional Chauffeurs, On Demand" },
      { property: "og:description", content: "Verified chauffeurs. Transparent pricing. Real-time tracking." },
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
      <Fleet />
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
            Trusted by 50,000+ riders across India
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[68px]">
            A professional chauffeur,<br />
            <span className="text-gradient-primary">a tap away.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Book verified, trained chauffeurs for your own car. City hops, outstation trips, hourly rentals or round trips — with transparent pricing and live tracking.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/book" className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:brightness-110">
              Book a Chauffeur
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-semibold hover:bg-muted">
              How it Works
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              { k: "50K+", v: "Happy Riders" },
              { k: "4.9★", v: "Avg. Rating" },
              { k: "1,200+", v: "Verified Drivers" },
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
  const [tab, setTab] = useState<"city" | "outstation" | "rental">("city");
  return (
    <div className="relative rounded-3xl border border-border bg-background p-5 shadow-lift md:p-6">
      <div className="absolute -inset-1 -z-10 rounded-[28px] bg-gradient-to-br from-primary/20 via-transparent to-secondary/30 blur-2xl" />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Book instantly</h3>
        <span className="rounded-full bg-secondary/40 px-2.5 py-1 text-[11px] font-semibold text-ink">Live pricing</span>
      </div>

      <div className="mt-4 inline-flex w-full rounded-2xl bg-muted p-1 text-sm">
        {(["city", "outstation", "rental"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl px-3 py-2 font-medium capitalize transition ${tab === t ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}>
            {t === "rental" ? "Hourly" : t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Field icon={<span className="h-2.5 w-2.5 rounded-full bg-primary" />} label="Pickup" value="Indiranagar, Bengaluru" />
        <Field icon={<span className="h-2.5 w-2.5 rounded-sm bg-secondary" />} label="Drop" value={tab === "rental" ? "Not required" : "Kempegowda Intl. Airport"} muted={tab === "rental"} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" value="Today" small />
          <Field label="Time" value="Now" small />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-subtle p-4">
        <div>
          <div className="text-xs text-muted-foreground">Estimated fare</div>
          <div className="text-2xl font-semibold tracking-tight">₹ {tab === "outstation" ? "2,499" : tab === "rental" ? "419" : "649"}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>Includes GST</div>
          <div>~ 34 km · 48 min</div>
        </div>
      </div>

      <Link to="/book" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
        Continue booking
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" />Insured trips</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Arrives in 8 min</span>
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
  const items = ["Zomato", "Swiggy", "Flipkart", "Razorpay", "Cred", "PhonePe", "Nykaa", "Meesho"];
  return (
    <section className="border-y border-border bg-subtle py-8">
      <div className="container-px mx-auto max-w-7xl">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Chauffeuring teams from</p>
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
    { icon: Shield, title: "Verified chauffeurs", body: "Background-checked, trained, and rated by real customers on every ride." },
    { icon: Zap, title: "8-minute arrivals", body: "Nearest driver dispatched instantly — average pickup under 8 minutes." },
    { icon: Wallet, title: "Transparent pricing", body: "See the fare before you book. No surge, no hidden fees, no surprises." },
    { icon: RouteIcon, title: "Real-time tracking", body: "Share live location with family. Live ETA, route line and driver details." },
    { icon: Award, title: "5★ service standard", body: "Uniformed drivers, safe driving score, and complimentary sanitized cabins." },
    { icon: Users, title: "24/7 support", body: "Real human support in under 30 seconds via chat, call, or WhatsApp." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why Driv A Long</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Premium rides. Priced fairly.</h2>
          <p className="mt-3 text-muted-foreground">Every detail engineered so you arrive relaxed, on time, and in style.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="reveal group rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift" style={{ transitionDelay: `${i * 30}ms` }}>
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
    { title: "One Side Trip", desc: "Point A to B with a professional chauffeur.", price: "From ₹299", icon: MapPin },
    { title: "Round Trip", desc: "Go and return the same day, one booking.", price: "From ₹899", icon: RouteIcon },
    { title: "Outstation", desc: "Long-distance trips across cities & states.", price: "From ₹2,499", icon: Car },
    { title: "Daily Rental", desc: "Hire an experienced driver by the hour.", price: "From ₹299/hr", icon: Clock },
  ];
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Every ride, covered.</h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">See all services <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div key={i} className="reveal group relative overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-lift">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition group-hover:bg-primary/10" />
              <s.icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold">{s.price}</span>
                <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
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
    { n: "01", t: "Enter your trip", d: "Pickup, drop, date and time." },
    { n: "02", t: "Choose your vehicle", d: "Hatchback, sedan, SUV, luxury or EV." },
    { n: "03", t: "See transparent fare", d: "Hourly packages or pay-as-you-go." },
    { n: "04", t: "Pay & track live", d: "Stripe, UPI, cards, or cash after trip." },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Booked in under 60 seconds.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="reveal relative rounded-3xl border border-border bg-background p-6 shadow-soft" style={{ transitionDelay: `${i * 40}ms` }}>
              <div className="text-4xl font-semibold tracking-tight text-primary/20">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fleet() {
  const cars = [
    { t: "Hatchback", s: "4 seats · AC · Automatic", p: "₹9/km" },
    { t: "Sedan", s: "4 seats · AC · Automatic", p: "₹12/km" },
    { t: "SUV", s: "6 seats · AC · Automatic", p: "₹16/km" },
    { t: "Luxury", s: "4 seats · Premium interior", p: "₹28/km" },
  ];
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">The Fleet</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">A ride for every occasion.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cars.map((c, i) => (
            <div key={i} className="reveal group rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
              <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10">
                <Car className="h-16 w-16 text-primary transition group-hover:scale-110" strokeWidth={1.4} />
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{c.t}</h3>
                <span className="text-sm font-semibold text-primary">{c.p}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { n: "Ananya Sharma", r: "Product Manager", q: "Cleanest booking flow I've used. Driver arrived in 6 minutes, uniform pressed. Felt like a private chauffeur service.", a: "AS" },
    { n: "Rohan Mehta", r: "Founder, Nudge", q: "Used Driv A Long for a Bengaluru → Mysuru trip. Transparent pricing, live tracking shared with my wife. Zero anxiety.", a: "RM" },
    { n: "Kavya Iyer", r: "Doctor", q: "I hire drivers hourly between hospital visits. The app remembers my saved addresses — genuinely thoughtful design.", a: "KI" },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Loved by riders</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">4.9 stars, 12,400+ reviews.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {t.map((x, i) => (
            <figure key={i} className="reveal rounded-3xl border border-border bg-background p-7 shadow-soft" style={{ transitionDelay: `${i * 50}ms` }}>
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground">"{x.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{x.a}</div>
                <div>
                  <div className="text-sm font-semibold">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do you drive my car or provide a vehicle?", a: "Both. Book a chauffeur for your own car, or choose from our fleet ranging from hatchbacks to luxury sedans and EVs." },
    { q: "How do you verify drivers?", a: "Every chauffeur passes a background check, license verification, drug screening, and completes a 3-day safety and etiquette training program." },
    { q: "What payment methods are supported?", a: "Stripe, Razorpay, UPI, credit/debit cards, net banking, wallets, and cash-after-trip. All transactions are secure and PCI-DSS compliant." },
    { q: "Can I schedule a ride in advance?", a: "Yes — schedule up to 30 days in advance. You'll get SMS + push reminders, and your driver will arrive 5 minutes early." },
    { q: "Is there a cancellation fee?", a: "Cancellations within 5 minutes of booking are free. After that, a small ₹49 fee applies to compensate the assigned driver." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-subtle py-20 md:py-28">
      <div className="container-px mx-auto max-w-3xl">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Questions, answered.</h2>
        </div>
        <div className="mt-12 space-y-3">
          {items.map((it, i) => (
            <div key={i} className="reveal overflow-hidden rounded-2xl border border-border bg-background">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="text-[15px] font-semibold">{it.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open === i ? "rotate-180 text-primary" : ""}`} />
              </button>
              {open === i && (
                <div className="animate-fade-in border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                  {it.a}
                </div>
              )}
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
      <div className="container-px mx-auto max-w-6xl">
        <div className="reveal relative overflow-hidden rounded-[32px] bg-primary p-10 shadow-lift md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Ready when you are.</h2>
              <p className="mt-4 max-w-md text-[15px] text-white/85">Your professional chauffeur is 8 minutes away. Book once, ride relaxed.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-soft transition hover:brightness-105">
                Book a Chauffeur <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                See how it works
              </Link>
            </div>
          </div>
          <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/20 pt-6 text-xs font-medium text-white/80">
            {["Verified chauffeurs", "Live tracking", "Transparent pricing", "24/7 support"].map((x) => (
              <span key={x} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />{x}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
