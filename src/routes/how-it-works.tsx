import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Car, Wallet, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Driv A Long" },
      { name: "description", content: "Book a chauffeur in four simple steps. Enter your trip, choose your ride, see transparent pricing, pay and track live." },
      { property: "og:title", content: "How Driv A Long Works" },
      { property: "og:description", content: "From booking to arrival in under 60 seconds." },
    ],
  }),
  component: How,
});

const steps = [
  { icon: MapPin, t: "Enter your trip", d: "Pickup and drop locations, date and time. We autocomplete addresses via Google Places." },
  { icon: Car, t: "Choose your vehicle", d: "Hatchback, sedan, SUV, luxury or EV. Automatic or manual, driver-only or with a car." },
  { icon: Wallet, t: "See transparent fare", d: "Hourly packages or pay-as-you-go — full breakdown with taxes shown upfront." },
  { icon: CheckCircle2, t: "Pay & track live", d: "Stripe, UPI, cards, wallets or cash after trip. Track your driver on a live map." },
];

function How() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Four steps. Zero friction.</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto max-w-4xl">
          <div className="relative space-y-8">
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
            <Link to="/book" className="inline-flex rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lift">
              Try it now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
