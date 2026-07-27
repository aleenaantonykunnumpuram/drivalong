import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Driv A Long" },
      { name: "description", content: "Get in touch with the Driv A Long team. 24/7 rider support, driver enquiries, and business partnerships." },
      { property: "og:title", content: "Contact Driv A Long" },
      { property: "og:description", content: "Talk to us — support, drivers and partnerships." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <section className="border-b border-border">
        <div className="container-px mx-auto max-w-4xl py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">We'd love to hear from you.</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">Support in under 30 seconds, 24/7.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px mx-auto grid max-w-6xl gap-10 md:grid-cols-5">
          <div className="space-y-5 md:col-span-2">
            {[
              { i: Phone, t: "Phone", d: "+91 80 4567 8900" },
              { i: Mail, t: "Email", d: "hello@drivalong.in" },
              { i: MapPin, t: "Office", d: "Indiranagar, Bengaluru 560038" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><x.i className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{x.t}</div>
                  <div className="mt-1 text-[15px] font-medium">{x.d}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); }}
            className="rounded-3xl border border-border bg-background p-7 shadow-soft md:col-span-3"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" placeholder="Ananya Sharma" />
              <Field label="Email" type="email" placeholder="ananya@work.com" />
              <Field label="Phone" placeholder="+91 98450 12345" />
              <Field label="Subject" placeholder="Business enquiry" />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">How can we help?</label>
              <textarea rows={5} required placeholder="Tell us a bit more…" className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-ring" />
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
              {sent ? <><CheckCircle2 className="h-4 w-4" /> Message sent</> : <>Send message <Send className="h-4 w-4" /></>}
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
      <label className="text-sm font-medium">{label}</label>
      <input required {...rest} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-ring" />
    </div>
  );
}
