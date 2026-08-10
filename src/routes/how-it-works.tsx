import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MapPin, Calendar, Clock, MessageSquare, UserCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Driv A Long Private Limited" },
      { name: "description", content: "Hire a professional chauffeur for your car in six simple steps. Choose service, enter pickup, select date & duration, confirm fare, and get driver assigned." },
      { property: "og:title", content: "How Driv A Long Private Limited Works" },
      { property: "og:description", content: "Professional driver hire process explained." },
    ],
  }),
  component: How,
});

const steps = [
  { icon: Compass, t: "Choose a Chauffeur Service", d: "Select from One-Way, Hourly, Full-Day, Airport, Designated Driver, Corporate, Event, or Outstation chauffeur rentals." },
  { icon: MapPin, t: "Enter Pickup Details", d: "Search your pickup address. Destination is completely optional for hourly or daily rentals." },
  { icon: Calendar, t: "Select Date & Time", d: "Request an immediate driver pickup (arrives in 15-20 min) or schedule for a future date & time." },
  { icon: Clock, t: "Choose Duration", d: "Select how many hours you need the chauffeur (1 Hour, 2 Hours, 4 Hours, 8 Hours, or Full Day)." },
  { icon: MessageSquare, t: "Book via WhatsApp", d: "Review your pre-filled booking details and send your request directly to our team on WhatsApp (+91 7306605416)." },
  { icon: UserCheck, t: "Driver Assigned", d: "A background-verified professional chauffeur arrives at your pickup location to drive your car." },
];

function How() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">6 Steps to Hire Your Driver.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            We provide verified professional drivers to drive your personal or company vehicle.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto max-w-4xl">
          <div className="relative space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-6 rounded-3xl border border-border bg-background p-7 shadow-soft">
                <div className="flex flex-col items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                    <s.icon className="h-5 w-5" />
                  </div>
                  {i < steps.length - 1 && <div className="mt-3 h-full w-px flex-1 bg-border" />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">Step {i + 1}</div>
                  <h3 className="mt-1 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lift hover:brightness-110">
              Book Your Chauffeur Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
