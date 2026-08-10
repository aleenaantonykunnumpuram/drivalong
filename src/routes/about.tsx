import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Users, MapPin, Heart, Mail, Phone, Linkedin, Building2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Driv A Long Private Limited" },
      { name: "description", content: "Driv A Long Private Limited is building India's most trusted chauffeur network — verified drivers, transparent pricing, and premium service." },
      { property: "og:title", content: "About Driv A Long Private Limited" },
      { property: "og:description", content: "India's most trusted on-demand chauffeur network." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="space-y-12 md:space-y-16">
      <section className="border-b border-border/70 bg-subtle/40 py-14 md:py-20">
        <div className="container-px mx-auto max-w-4xl text-center">
          <img src="/logo.png" alt="Driv A Long Private Limited" className="mx-auto h-14 md:h-16 w-auto object-contain mb-5" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Our Story</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Chauffeur Service, <span className="text-gradient-primary">Reimagined by Driv A Long.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            We started Driv A Long Private Limited with one core vision: hiring a verified, professional driver for your car should feel as effortless as booking a ride, with the luxury and dignity of a private chauffeur.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container-px mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Award, k: "Background Verified", v: "Complete Document & Police Check" },
            { icon: Users, k: "Professional Drivers", v: "Manual & Automatic Car Experts" },
            { icon: Building2, k: "Corporate & Personal", v: "Tailored Flexible Bookings" },
            { icon: Heart, k: "24/7 Support", v: "Safe & Reliable Service Standard" },
          ].map((x, i) => (
            <div key={i} className="rounded-3xl border border-border/80 bg-background p-6 text-center shadow-card transition-all duration-200 hover:border-primary/40">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <x.icon className="h-5 w-5" />
              </div>
              <div className="text-base font-bold tracking-tight text-foreground">{x.k}</div>
              <div className="mt-1 text-xs font-semibold text-muted-foreground">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-subtle/70 py-14 md:py-20 border-y border-border/60">
        <div className="container-px mx-auto grid max-w-6xl gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Our Mission</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              Building India's Most Trusted Chauffeur Platform.
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
              To give every vehicle owner in India a safer, calmer, and more dignified way to travel — while empowering verified drivers with respectful, transparent careers.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-110 active:scale-98"
            >
              <span>Get In Touch</span>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              "100% background-verified and safety-trained chauffeurs.",
              "Transparent, no-surge pricing shown upfront before you book.",
              "Fair pay and dignity for our chauffeur partners.",
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-background p-4 shadow-soft">
                <p className="text-xs font-semibold text-foreground leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Company Details Card Section */}
      <section className="py-12 pb-16">
        <div className="container-px mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border/80 bg-background p-6 md:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Driv A Long Private Limited" className="h-14 w-auto object-contain shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Driv A Long Private Limited</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">
                  13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Ernakulam – 682504, Kerala
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a href="tel:+917306605416" className="flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                <Phone className="h-3.5 w-3.5 text-primary" /> +91 7306605416
              </a>
              <a href="mailto:info@drivalong.com" className="flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
                <Mail className="h-3.5 w-3.5 text-primary" /> info@drivalong.com
              </a>
              <a href="https://www.linkedin.com/company/driv-a-long-private-limited" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-[#0A66C2] px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
