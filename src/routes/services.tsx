import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Clock, Award, Plane, Shield, Building2, PartyPopper, Navigation, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Chauffeur Services — Driv A Long" },
      { name: "description", content: "Hire professional drivers on demand for your own vehicle. One-Way, Hourly, Full-Day, Airport, Designated Driver, Corporate & Outstation." },
      { property: "og:title", content: "Chauffeur Rental Services — Driv A Long" },
      { property: "og:description", content: "Professional drivers for your vehicle on demand." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: Compass, title: "One-Way Chauffeur", desc: "Hire a professional driver for a single point-to-point trip in your personal car.", price: "From ₹299" },
  { icon: Clock, title: "Hourly Chauffeur", desc: "Flexible hourly driver rental for shopping, errands, or multiple city stops.", price: "From ₹349" },
  { icon: Award, title: "Full-Day Chauffeur", desc: "Dedicated chauffeur for your vehicle for the entire day (8 to 24 hours).", price: "From ₹1,499" },
  { icon: Plane, title: "Airport Chauffeur", desc: "Reliable airport pickup or drop-off service in the comfort of your own car.", price: "From ₹499" },
  { icon: Shield, title: "Designated Driver", desc: "Safe drive home service after parties, events, or nightlife in your vehicle.", price: "From ₹399" },
  { icon: Building2, title: "Corporate Chauffeur", desc: "Executive chauffeurs for business meetings, VIP guests, and company mobility.", price: "From ₹799" },
  { icon: PartyPopper, title: "Event Chauffeur", desc: "Tailored chauffeur service for weddings, family functions, and special occasions.", price: "From ₹699" },
  { icon: Navigation, title: "Outstation Chauffeur", desc: "Experienced highway drivers for long-distance intercity road trips.", price: "From ₹999" },
];

function Services() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Chauffeur Catalog</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Your Driver. Your Car.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            We provide verified, experienced chauffeurs to drive your personal or executive vehicle on demand.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-lift flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition group-hover:bg-primary/10" />
              <div>
                <s.icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{s.price}</span>
                <Link to="/book" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft hover:brightness-110">
                  Book Driver <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
