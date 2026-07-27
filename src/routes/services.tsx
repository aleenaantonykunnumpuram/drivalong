import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, RouteIcon, Car, Clock, Plane, Building2 } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Driv A Long" },
      { name: "description", content: "City rides, outstation, round trips, hourly rentals, airport transfers and monthly chauffeurs. Verified drivers, transparent pricing." },
      { property: "og:title", content: "Chauffeur Services — Driv A Long" },
      { property: "og:description", content: "City, outstation, hourly, round trip, airport & monthly chauffeurs." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: MapPin, title: "One Side Trip", desc: "Point-to-point city rides with a professional chauffeur driving your car or ours.", price: "From ₹299" },
  { icon: RouteIcon, title: "Round Trip", desc: "Go and return the same day with a single booking. No juggling multiple rides.", price: "From ₹899" },
  { icon: Car, title: "Outstation", desc: "Long-distance intercity trips across states with experienced highway chauffeurs.", price: "From ₹2,499" },
  { icon: Clock, title: "Hourly Rental", desc: "Hire a driver by the hour for errands, meetings or family days out.", price: "From ₹299/hr" },
  { icon: Plane, title: "Airport Transfer", desc: "Punctual pickups and drops with flight-tracking and complimentary wait time.", price: "From ₹599" },
  { icon: Building2, title: "Monthly Chauffeur", desc: "A dedicated driver for daily commutes with predictable monthly billing.", price: "From ₹19,999/mo" },
];

function Services() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Services</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">One app. Every kind of ride.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            From a quick city hop to a week-long road trip, we have a plan for it.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl border border-border bg-background p-7 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-lift">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition group-hover:bg-primary/10" />
              <s.icon className="h-9 w-9 text-primary" strokeWidth={1.6} />
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold">{s.price}</span>
                <Link to="/book" className="text-sm font-semibold text-primary hover:underline">Book →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
