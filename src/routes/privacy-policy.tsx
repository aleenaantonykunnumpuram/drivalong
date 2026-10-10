import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { ShieldCheck, Lock, UserCheck, Eye, Database } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Driv A Long Private Limited" },
      {
        name: "description",
        content:
          "Driv A Long Private Limited Privacy Policy. Comprehensive data protection, handling, DPDP Act 2023 compliance, and user privacy rights.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Data Protection & Privacy Standards — Driv A Long Private Limited"
      activeTab="privacy"
    >
      <div className="space-y-8 text-sm">
        {/* Document Header Metadata */}
        <div className="border-b border-border pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Corporate Identification Number: <strong className="text-foreground">U52291KL2026PTC104826</strong></span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600">Last updated: October 2026</span>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-foreground flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <p>
              Your privacy matters to <strong>Driv A Long Private Limited</strong> ("Driv A Long", "we", "us", "our"). This Privacy Policy explains how we collect, use, disclose, and protect personal information in connection with the Site, the Application, and the Services (together, the "Offerings"), covering both our Customer-facing and Driver Partner-facing platforms.
            </p>
          </div>
        </div>

        {/* Legal Framework Reference */}
        <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            This Privacy Policy is incorporated by reference into, and should be read together with, the <strong>Driv A Long User Terms and Conditions</strong> and the <strong>Driv A Long Driver Partner Terms and Conditions</strong>. BY ACCEPTING THOSE TERMS OR OTHERWISE USING THE OFFERINGS, YOU AGREE TO THE TERMS OF THIS PRIVACY POLICY.
          </p>
          <p>
            This Privacy Policy is framed with reference to the <strong>Information Technology Act, 2000</strong> and the rules made thereunder, and the <strong>Digital Personal Data Protection Act, 2023 ("DPDP Act")</strong>, to the extent its provisions are in force from time to time.
          </p>
        </div>

        {/* 1. Definitions */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">1. DEFINITIONS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>1.1 "Personal Data"</strong> means any data about an individual who is identifiable by or in relation to such data, and includes what this Policy refers to as "Protected Information".</p>
            <p><strong>1.2 "Protected Information"</strong> means information that could reasonably be used to identify you personally, including your name, e-mail address, mobile number, address, and (for Driver Partners) driving licence and vehicle details.</p>
            <p><strong>1.3 "Usage Information"</strong> means information automatically collected regarding your use of the Offerings, including device identifiers, browser/app information, and in-app activity.</p>
            <p><strong>1.4 "Data Principal"</strong> (under the DPDP Act) means the individual to whom the Personal Data relates; <strong>"Data Fiduciary"</strong> means Driv A Long, which determines the purpose and means of processing such data.</p>
          </div>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">2. INFORMATION WE COLLECT</h2>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div>
              <strong className="text-foreground block mb-1">2.1 Information you provide to us</strong>
              <p>When you register for an Account or Driver Partner profile, or otherwise interact with us, we may collect: name, e-mail, password, address, mobile number, and, where applicable, vehicle registration number and model, driving licence details, PAN, and bank account details for settlement of payments.</p>
            </div>

            <div>
              <strong className="text-foreground block mb-1">2.2 Information collected automatically</strong>
              <p>We and our service providers may automatically collect Usage Information, including the browser or app version used, pages or screens visited, device identifiers, and, during an active Booking, GPS location data transmitted from the Driver Partner's and/or Customer's device to enable pickup, tracking and safety features. We may also record calls made to our call centre for quality, training, and dispute-resolution purposes.</p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1 text-foreground">
              <strong className="text-primary block">2.3 In-trip safety recordings</strong>
              <p className="text-xs">
                Where the Application offers an in-trip audio-recording safety feature, any such recording is initiated and controlled by the Customer, is stored on the Customer's device, and is not continuously monitored by Driv A Long. We access such a recording only where the Customer voluntarily shares it in connection with a safety incident, grievance, or investigation, and we use it solely for that purpose. Such recordings are not used for routine monitoring, profiling, performance evaluation, or marketing, and are retained only as long as necessary to resolve the relevant issue or meet statutory requirements.
              </p>
            </div>

            <div>
              <strong className="text-foreground block mb-1">2.4 Information from third parties</strong>
              <p>We may supplement the information we hold with information from background-verification agencies, payment processors, and other third parties engaged in connection with the Offerings.</p>
            </div>
          </div>
        </section>

        {/* 3. How We Use Information */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">3. HOW WE USE INFORMATION</h2>
          <p className="text-xs text-muted-foreground">We use Personal Data and Usage Information to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            <li>(a) create and administer your Account;</li>
            <li>(b) facilitate and complete Bookings, including sharing necessary Booking details between a Customer and the assigned Driver Partner;</li>
            <li>(c) process payments and settlements;</li>
            <li>(d) provide customer support and respond to queries or complaints;</li>
            <li>(e) verify Driver Partner eligibility and conduct background checks;</li>
            <li>(f) improve, secure, and troubleshoot the Offerings;</li>
            <li>(g) send service-related communications and, where you have not opted out, promotional communications;</li>
            <li>(h) prevent, detect and investigate fraud or violations of our terms; and</li>
            <li>(i) comply with Applicable Law and respond to lawful requests from government or law-enforcement authorities.</li>
          </ul>
        </section>

        {/* 4. Disclosure of Information */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">4. DISCLOSURE OF INFORMATION</h2>
          <p className="text-xs text-muted-foreground">We do not sell or rent your Personal Data. We may share it in the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li><strong>With Driver Partners / Customers:</strong> With the Driver Partner assigned to your Booking (your name, pickup location, and contact number), or with the Customer, as necessary to perform the Service.</li>
            <li><strong>Service Providers:</strong> With service providers who perform functions on our behalf, such as payment processors, background-verification agencies, cloud hosting providers, and analytics providers, each bound to protect such data at least to the standard set out in this Policy and to use it solely to perform services for us.</li>
            <li><strong>Law Enforcement & Government:</strong> With government or law-enforcement authorities, where required to comply with Applicable Law, legal process, or to protect the safety, rights or property of Driv A Long, our users, or the public.</li>
            <li><strong>Corporate Transactions:</strong> In connection with a merger, acquisition, restructuring, or sale of assets, subject to the acquiring entity agreeing to honour the commitments in this Policy.</li>
            <li><strong>With Your Consent:</strong> With your consent, where you choose to share information with a third party through a feature of the Offerings.</li>
          </ul>
        </section>

        {/* 5. Data Retention */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">5. DATA RETENTION</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We retain Personal Data for as long as your Account is active and as necessary to provide the Offerings. Following closure of your Account, we may continue to retain Booking history, transaction records, and related Personal Data for as long as necessary to comply with legal and regulatory obligations (including tax and accounting requirements), resolve disputes, prevent fraud, and enforce our agreements, after which such data will be securely deleted or anonymised.
          </p>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">6. YOUR RIGHTS (DPDP ACT 2023)</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Subject to Applicable Law (including, once notified and in force, the rights available under the DPDP Act), you may:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            <li>(a) access and request a copy of the Personal Data we hold about you;</li>
            <li>(b) request correction of inaccurate or incomplete Personal Data;</li>
            <li>(c) withdraw consent to processing that is based on consent, without affecting the lawfulness of processing carried out before such withdrawal;</li>
            <li>(d) request erasure of your Personal Data, subject to our right to retain data required for legal, regulatory, or dispute-resolution purposes; and</li>
            <li>(e) nominate another individual to exercise these rights on your behalf in the event of your death or incapacity, to the extent such a mechanism is prescribed under Applicable Law.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Requests may be sent to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a>.
          </p>
        </section>

        {/* 7. Security */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">7. SECURITY</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We implement reasonable security practices and procedures, including encryption, firewalls, and access controls, to protect Personal Data against unauthorised access, alteration, disclosure, or destruction, consistent with the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        {/* 8. Cookies and Tracking */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">8. COOKIES AND TRACKING</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Site may use cookies and similar technologies to remember preferences and understand usage patterns. You may control cookies through your browser or device settings; disabling cookies may affect certain features of the Offerings.
          </p>
        </section>

        {/* 9. Third-Party Links */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">9. THIRD-PARTY LINKS AND SERVICES</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Offerings may link to or integrate with third-party services (such as payment gateways or map services). We are not responsible for the privacy practices of such third parties, and we encourage you to review their privacy policies independently.
          </p>
        </section>

        {/* 10. Information Collected by Driver Partners */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">10. INFORMATION COLLECTED BY DRIVER PARTNERS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This Privacy Policy does not govern any information about a customer that a Driver Partner may separately obtain otherwise than through Driv A Long, and Driv A Long is not responsible for a Driver Partner's independent use of such information.
          </p>
        </section>

        {/* 11. Children's Data */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">11. CHILDREN'S DATA</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Offerings are not directed at children. Where a minor uses the Offerings under the supervision of a parent or guardian as permitted under the User Terms, we process such information only as reasonably necessary to provide the Service and in accordance with any verifiable-parental-consent requirements under Applicable Law.
          </p>
        </section>

        {/* 12. Cross-Border Transfer */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">12. CROSS-BORDER TRANSFER</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Where we engage service providers whose servers are located outside India, your Personal Data may be transferred to, and processed in, such jurisdictions, subject to appropriate contractual safeguards and, where applicable, in a manner consistent with the DPDP Act and rules notified thereunder.
          </p>
        </section>

        {/* 13. Grievance Officer */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">13. GRIEVANCE OFFICER</h2>
          <div className="rounded-2xl border border-border bg-subtle/50 p-4 space-y-2 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              In accordance with the Information Technology Act, 2000 and rules made thereunder, and the DPDP Act (once its grievance-redressal provisions are notified), Driv A Long has appointed a Grievance Officer, who may be contacted as follows:
            </p>
            <div className="pt-2 space-y-1 font-medium text-foreground">
              <p><strong>Designation:</strong> Grievance Officer, Driv A Long</p>
              <p><strong>E-mail:</strong> <a href="mailto:info@drivalong.com" className="text-primary hover:underline">info@drivalong.com</a></p>
              <p><strong>Address:</strong> 13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Kerala – 682504, India</p>
            </div>
          </div>
        </section>

        {/* 14. Changes to This Policy */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">14. CHANGES TO THIS POLICY</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices or Applicable Law. Material changes will be notified to you by e-mail or a prominent notice on the Site prior to the change taking effect. We encourage you to review this Policy periodically.
          </p>
        </section>

        {/* 15. Contact Us */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">15. CONTACT US</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            For questions regarding this Privacy Policy, please write to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
