import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, RefreshCw, Award, Plane, Shield, Building2, PartyPopper, Navigation, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Chauffeur Services — Driv A Long Private Limited" },
      { name: "description", content: "Hire professional drivers on demand for your own vehicle. One-Way, Round-Trip, Full-Day, Airport, Designated Driver, Corporate & Outstation." },
      { property: "og:title", content: "Chauffeur Rental Services — Driv A Long Private Limited" },
      { property: "og:description", content: "Professional drivers for your vehicle on demand." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: Compass, title: "One-Way Chauffeur", desc: "Hire a professional driver for a single point-to-point trip in your personal car.", price: "Transparent Fare Standard" },
  { icon: RefreshCw, title: "Round-Trip Chauffeur", desc: "Two-way driver service for round trips, return journeys, shopping & errands.", price: "Transparent Fare Standard" },
  { icon: Award, title: "Full-Day Chauffeur", desc: "Dedicated chauffeur for your vehicle for the entire day (8 to 24 hours).", price: "Transparent Fare Standard" },
  { icon: Plane, title: "Airport Chauffeur", desc: "Reliable airport pickup or drop-off service in the comfort of your own car.", price: "Transparent Fare Standard" },
  { icon: Shield, title: "Designated Driver", desc: "Safe drive home service after parties, events, or nightlife in your vehicle.", price: "Transparent Fare Standard" },
  { icon: Building2, title: "Corporate Chauffeur", desc: "Executive chauffeurs for business meetings, VIP guests, and company mobility.", price: "Transparent Fare Standard" },
  { icon: PartyPopper, title: "Event Chauffeur", desc: "Tailored chauffeur service for weddings, family functions, and special occasions.", price: "Transparent Fare Standard" },
  { icon: Navigation, title: "Outstation Chauffeur", desc: "Experienced highway drivers for long-distance intercity road trips.", price: "Transparent Fare Standard" },
];

function Services() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#061847] via-[#0B2D7A] to-[#041235] py-20 text-center text-white relative overflow-hidden">
        <div className="container-px mx-auto max-w-4xl relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#F4B400]">
            CHAUFFEUR CATALOGUE
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Your driver. Your car.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-blue-100/80 font-normal leading-relaxed">
            Verified, experienced chauffeurs who drive your personal or executive vehicle on demand — with complete price transparency.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-px mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl border border-border/80 bg-background p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card-hover flex flex-col justify-between">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition group-hover:bg-primary/10" />
              <div>
                <s.icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
                <h3 className="mt-5 text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary">{s.price}</span>
                <Link to="/book" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110 active:scale-98">
                  Request Booking <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
