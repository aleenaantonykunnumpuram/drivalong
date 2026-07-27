import { Link } from "@tanstack/react-router";
import { Car, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-subtle">
      <div className="container-px mx-auto max-w-7xl py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Car className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="text-[17px] font-semibold tracking-tight">Driv <span className="text-primary">A</span> Long</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Professional, verified chauffeurs on demand. City rides, outstation trips, hourly rentals, and round trips — booked in under 60 seconds.
            </p>
            <div className="mt-6 flex gap-2">
              {[Twitter, Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-background transition hover:border-primary hover:text-primary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Quick Links" links={[
            { to: "/", label: "Home" },
            { to: "/about", label: "About Us" },
            { to: "/how-it-works", label: "How It Works" },
            { to: "/contact", label: "Contact" },
          ]} />
          <FooterCol title="Services" links={[
            { to: "/services", label: "City Rides" },
            { to: "/services", label: "Outstation" },
            { to: "/services", label: "Hourly Rentals" },
            { to: "/services", label: "Round Trip" },
          ]} />
          <FooterCol title="Legal" links={[
            { to: "/", label: "Privacy Policy" },
            { to: "/", label: "Terms of Service" },
            { to: "/", label: "Refund Policy" },
            { to: "/contact", label: "Support" },
          ]} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {year} Driv A Long Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Made with care in Bengaluru, India.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-sm text-muted-foreground transition hover:text-primary">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
