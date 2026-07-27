import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Users, MapPin, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Driv A Long" },
      { name: "description", content: "We're building India's most trusted chauffeur network — verified drivers, transparent pricing, and premium service." },
      { property: "og:title", content: "About Driv A Long" },
      { property: "og:description", content: "India's most trusted on-demand chauffeur network." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our Story</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Chauffeur service, <span className="text-gradient-primary">reimagined for India.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            We started Driv A Long in 2022 with one belief: hiring a professional driver should feel as effortless as booking a cab, but as premium as a private chauffeur.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
          {[
            { icon: Users, k: "50,000+", v: "Riders served" },
            { icon: MapPin, k: "22", v: "Cities live" },
            { icon: Award, k: "1,200+", v: "Verified chauffeurs" },
            { icon: Heart, k: "4.9★", v: "Average rating" },
          ].map((x, i) => (
            <div key={i} className="rounded-3xl border border-border bg-background p-8 text-center shadow-soft">
              <x.icon className="mx-auto h-8 w-8 text-primary" />
              <div className="mt-4 text-3xl font-semibold tracking-tight">{x.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-subtle py-20">
        <div className="container-px mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Our mission</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              To give every rider in India a safer, calmer, more dignified way to move — while giving drivers a fair, respectful career they can be proud of.
            </p>
            <Link to="/contact" className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft">Get in touch</Link>
          </div>
          <div className="space-y-4">
            {["Every driver background-verified and safety-trained.", "Transparent, no-surge pricing shown before you book.", "Fair pay and health insurance for our chauffeur partners."].map((t, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-5 shadow-soft">
                <p className="text-[15px] leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
