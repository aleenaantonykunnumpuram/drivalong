import { Link } from "@tanstack/react-router";
import { Shield, FileText, RotateCcw, Building2, Mail, Phone, MapPin, Printer } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  activeTab: "terms" | "privacy" | "refund";
  children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, activeTab, children }: LegalLayoutProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="border-b border-[#1E4193]/30 bg-[#0B2D7A] text-white py-12 md:py-16">
        <div className="container-px mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F4B400] backdrop-blur-sm">
                <Building2 className="h-3.5 w-3.5" />
                <span>CIN: U52291KL2026PTC104826</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
                {title}
              </h1>
              <p className="text-xs text-blue-200/80 sm:text-sm font-medium">
                {subtitle || "Driv A Long Private Limited — Legal & Compliance Documentation"}
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-white/20 active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="h-4 w-4 text-[#F4B400]" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          {/* Legal Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <Link
              to="/terms-of-service"
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === "terms"
                  ? "bg-[#F4B400] text-slate-950 shadow-soft"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </Link>

            <Link
              to="/privacy-policy"
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === "privacy"
                  ? "bg-[#F4B400] text-slate-950 shadow-soft"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </Link>

            <Link
              to="/refund-policy"
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === "refund"
                  ? "bg-[#F4B400] text-slate-950 shadow-soft"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refund & Cancellation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-px mx-auto max-w-5xl py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main Document Body */}
          <main className="lg:col-span-8 rounded-3xl border border-border bg-background p-6 md:p-10 shadow-soft space-y-8 text-foreground leading-relaxed">
            {children}
          </main>

          {/* Quick Info Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-border bg-subtle/50 p-6 space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Corporate Entity
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Driv A Long Private Limited</strong>
                </p>
                <p>
                  CIN: <span className="font-mono text-primary font-bold">U52291KL2026PTC104826</span>
                </p>
                <div className="pt-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Kerala – 682504, India
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-subtle/50 p-6 space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Grievance & Legal Help
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For questions regarding user terms, privacy rights, or billing and cancellations, please reach out to our legal and support team:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <a href="mailto:info@drivalong.com" className="font-semibold text-primary hover:underline">
                    info@drivalong.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <a href="tel:+917306605416" className="font-semibold text-foreground hover:text-primary">
                    +91 7306605416
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-primary text-sm">Need to book a ride?</p>
              <p>Hire verified professional chauffeurs on-demand for your car in seconds.</p>
              <div className="pt-2">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110"
                >
                  Book Chauffeur Now
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
