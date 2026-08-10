import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#1E4193] bg-[#0B2D7A] text-white">
      <div className="container-px mx-auto max-w-7xl py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Driv A Long Private Limited"
                className="h-10 w-auto max-w-[44px] object-contain transition-transform duration-300 group-hover:scale-105 bg-white rounded-lg p-0.5"
              />
              <div>
                <span className="text-[19px] font-bold tracking-tight block leading-tight text-white">
                  Driv <span className="text-[#F4B400]">A</span> Long
                </span>
                <span className="text-[11px] font-semibold text-blue-200/80 tracking-widest uppercase">
                  Private Limited
                </span>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-blue-100/80 font-normal">
              Professional, verified chauffeurs on demand. City rides, outstation trips, hourly rentals, and round trips — booked seamlessly in seconds.
            </p>

            <div className="mt-6 space-y-2.5 text-xs text-blue-100/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#F4B400] shrink-0 mt-0.5" />
                <span className="leading-relaxed">13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Ernakulam – 682504, Kerala</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#F4B400] shrink-0" />
                <a href="tel:+917306605416" className="hover:text-[#F4B400] transition-colors font-semibold">+91 7306605416</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#F4B400] shrink-0" />
                <a href="mailto:info@drivalong.com" className="hover:text-[#F4B400] transition-colors font-semibold">info@drivalong.com</a>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://www.linkedin.com/company/driv-a-long-private-limited"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Driv A Long Private Limited LinkedIn"
                title="Driv A Long Private Limited on LinkedIn"
                className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/30 bg-[#143B93] text-white transition-all duration-200 hover:border-[#F4B400] hover:text-[#F4B400] hover:scale-105"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/30 bg-[#143B93] text-white transition-all duration-200 hover:border-[#F4B400] hover:text-[#F4B400] hover:scale-105">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/30 bg-[#143B93] text-white transition-all duration-200 hover:border-[#F4B400] hover:text-[#F4B400] hover:scale-105">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-xl border border-blue-400/30 bg-[#143B93] text-white transition-all duration-200 hover:border-[#F4B400] hover:text-[#F4B400] hover:scale-105">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterCol title="Quick Links" links={[
            { to: "/", label: "Home" },
            { to: "/about", label: "About Us" },
            { to: "/how-it-works", label: "How It Works" },
            { to: "/contact", label: "Contact Us" },
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

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-blue-400/20 pt-6 text-xs text-blue-200/80 sm:flex-row sm:items-center">
          <p>© {year} Driv A Long Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Ernakulam, Kerala, India</span>
            <button
              onClick={scrollToTop}
              title="Back to Top"
              aria-label="Back to top"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/30 bg-[#143B93] px-3.5 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:border-[#F4B400] hover:text-[#F4B400] active:scale-95"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-white uppercase tracking-wider text-[12px]">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-xs text-blue-100/75 transition-colors hover:text-[#F4B400]">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
