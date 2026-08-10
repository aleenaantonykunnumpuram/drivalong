import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2, Linkedin, Building2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Driv A Long Private Limited" },
      { name: "description", content: "Get in touch with Driv A Long Private Limited. 24/7 rider support, driver enquiries, and business partnerships." },
      { property: "og:title", content: "Contact Driv A Long Private Limited" },
      { property: "og:description", content: "Talk to us — support, drivers and partnerships." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section className="border-b border-border/70 bg-subtle/40">
        <div className="container-px mx-auto max-w-4xl py-14 md:py-20 text-center">
          <img
            src="/logo.png"
            alt="Driv A Long Private Limited"
            className="mx-auto h-14 md:h-16 w-auto object-contain mb-5"
          />
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Get In Touch</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Driv A Long Private Limited
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed md:text-base">
            We'd love to hear from you. Rider support, driver onboarding, or enterprise inquiries — available 24/7.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-px mx-auto grid max-w-6xl gap-8 md:grid-cols-5 items-start">
          <div className="space-y-3.5 md:col-span-2">
            <div className="flex items-start gap-4 rounded-3xl border border-border/80 bg-background p-5 shadow-card transition-all duration-200 hover:border-primary/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company</div>
                <div className="mt-1 text-sm font-bold text-foreground">Driv A Long Private Limited</div>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-border/80 bg-background p-5 shadow-card transition-all duration-200 hover:border-primary/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</div>
                <a href="tel:+917306605416" className="mt-1 text-sm font-bold text-foreground hover:text-primary transition-colors block">
                  +91 7306605416
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-border/80 bg-background p-5 shadow-card transition-all duration-200 hover:border-primary/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</div>
                <a href="mailto:info@drivalong.com" className="mt-1 text-sm font-bold text-foreground hover:text-primary transition-colors block">
                  info@drivalong.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-border/80 bg-background p-5 shadow-card transition-all duration-200 hover:border-primary/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registered Office</div>
                <div className="mt-1 text-xs font-semibold leading-relaxed text-foreground">
                  13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Ernakulam – 682504, Kerala
                </div>
              </div>
            </div>

            <a
              href="https://www.linkedin.com/company/driv-a-long-private-limited"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-3xl border border-border/80 bg-background p-5 shadow-card transition-all duration-200 hover:border-primary/50 group"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2]">
                <Linkedin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LinkedIn</div>
                <div className="mt-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Driv A Long Private Limited
                </div>
              </div>
            </a>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              setTimeout(() => setSent(false), 4000);
            }}
            className="rounded-3xl border border-border/80 bg-background p-6 md:p-8 shadow-card md:col-span-3 space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Send Us a Message</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" placeholder="Ananya Sharma" />
              <Field label="Email address" type="email" placeholder="ananya@work.com" />
              <Field label="Phone number" placeholder="+91 98450 12345" />
              <Field label="Subject" placeholder="Business enquiry" />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">How can we help?</label>
              <textarea
                rows={5}
                required
                placeholder="Tell us a bit more about your trip or query…"
                className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-xs outline-none transition-all duration-200 focus:border-primary focus:shadow-ring placeholder:text-muted-foreground/60"
              />
            </div>

            <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-110 active:scale-98">
              {sent ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> <span>Message Sent Successfully</span>
                </>
              ) : (
                <>
                  <span>Send Message</span> <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground">{label}</label>
      <input
        required
        {...rest}
        className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-xs outline-none transition-all duration-200 focus:border-primary focus:shadow-ring placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
