import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Driv A Long Private Limited" },
      {
        name: "description",
        content:
          "Read the User Terms and Conditions for Driv A Long Private Limited. Electronic agreement governing chauffeur-on-demand services, bookings, fares, and user responsibilities.",
      },
    ],
  }),
  component: TermsOfServicePage,
});

export function TermsOfServicePage() {
  return (
    <LegalLayout
      title="User Terms and Conditions"
      subtitle="Binding Electronic Agreement — Driv A Long Private Limited"
      activeTab="terms"
    >
      <div className="space-y-8 text-sm">
        {/* Document Header Metadata */}
        <div className="border-b border-border pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Corporate Identification Number: <strong className="text-foreground">U52291KL2026PTC104826</strong></span>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">Last updated: October 2026</span>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>IMPORTANT NOTICE:</strong> If this document is not in a language that you understand, please contact us at{" "}
              <a href="mailto:info@drivalong.com" className="underline font-bold text-amber-950 dark:text-amber-100">
                info@drivalong.com
              </a>{" "}
              before accepting these terms.
            </p>
          </div>
        </div>

        {/* Preamble */}
        <div className="space-y-4">
          <p className="leading-relaxed">
            These Driv A Long User Terms and Conditions ("User Terms") constitute a binding electronic agreement between you and Driv A Long, governing your access to and use of the Site, the Application, and the Services (together, the "Offerings"). This document is an electronic record within the meaning of the <strong>Information Technology Act, 2000</strong> and the rules made thereunder, and does not require any physical or digital signature.
          </p>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-medium space-y-2 text-foreground">
            <p className="font-bold text-primary">ACCEPTANCE OF TERMS:</p>
            <p>
              BY CREATING AN ACCOUNT, CLICKING "I ACCEPT", OR OTHERWISE ACCESSING OR USING ANY OF THE OFFERINGS, YOU CONFIRM THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE USER TERMS. IF YOU DO NOT AGREE, PLEASE DO NOT ACCESS OR USE THE OFFERINGS.
            </p>
            <p>
              Your acceptance of these User Terms includes your acceptance of the <strong>Driv A Long Privacy Policy</strong> and the <strong>Driv A Long Refund and Cancellation Policy</strong>, each of which is incorporated herein by reference.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            In these User Terms, "we", "us", "our" and "Driv A Long" refer to <strong>Driv A Long Private Limited</strong>, and "you" and "your" refer to a customer using the Offerings.
          </p>
        </div>

        {/* 1. Definitions */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">1. DEFINITIONS</h2>
          <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
            <p><strong>1.1 "Account"</strong> means the account created by a Customer on the Site to avail the Services.</p>
            <p><strong>1.2 "Application" or "App"</strong> means the Driv A Long mobile application, as updated by us from time to time.</p>
            <p><strong>1.3 "Booking"</strong> means a request for provision of a Service made by a Customer through the Site or Driv A Long's call centre.</p>
            <p><strong>1.4 "City of Operation"</strong> means a city or region in which Customers and Driver Partners are able to avail and render, respectively, the Services.</p>
            <p><strong>1.5 "Convenience Fee"</strong> means the fee charged by Driv A Long for the technology and facilitation services offered through the Site, exclusive of applicable taxes.</p>
            <p><strong>1.6 "Customer", "you" or "your"</strong> means a person who has, or is in the process of creating, an Account on the Application.</p>
            <p><strong>1.7 "Driver Partner"</strong> means a driver or chauffeur who has enlisted with Driv A Long (whether as an employee, contractor, or through a verified independent network) to render the driving component of the Services. A Driver Partner shall at no point be entitled to represent themself as an employee of Driv A Long, save where the Driver Partner is in fact engaged by Driv A Long on an employment basis.</p>
            <p><strong>1.8 "Fare"</strong> means the amount payable by the Customer for a Booking, which may comprise a base fare, distance/time-based charges, night charges, waiting charges, the Convenience Fee, any Cancellation Fee, tolls and permit charges, and applicable taxes.</p>
            <p><strong>1.9 "Services"</strong> means the driver-on-demand, chauffeur, pickup-and-drop, outstation driving, travel assistance, and allied trip/experience booking services made available by Driv A Long through the Site, together with any ancillary travel-agency or tour-operator services separately confirmed in writing.</p>
            <p><strong>1.10 "Site"</strong> means the Application, the Driv A Long website, and any other software or interface through which the Offerings are made available.</p>
            <p><strong>1.11</strong> Capitalised terms not defined in this Clause 1 shall have the meaning ascribed to them elsewhere in these User Terms.</p>
          </div>
        </section>

        {/* 2. Eligibility */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">2. ELIGIBILITY</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>2.1</strong> You represent and warrant that you have the legal capacity and authority to accept these User Terms, whether on your own behalf or on behalf of an entity you are duly authorised to represent.</p>
            <p><strong>2.2</strong> You shall not access or use the Offerings if you are not competent to contract under the Indian Contract Act, 1872.</p>
            <p><strong>2.3</strong> Persons under the age of 18 (eighteen) years may use the Offerings only under the strict guidance and supervision of a parent or legal guardian, who shall be responsible for all Bookings made and Charges incurred.</p>
          </div>
        </section>

        {/* 3. Registration and Account */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">3. REGISTRATION AND ACCOUNT</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>3.1</strong> You may register on the Site by providing accurate, complete, current and true registration data, including your name, mobile number, e-mail address, and such other information as Driv A Long may reasonably require ("Registration Data"), and you shall keep such Registration Data updated at all times.</p>
            <p><strong>3.2</strong> We bear no liability for false, incomplete, outdated or incorrect Registration Data supplied by you. We reserve the right to suspend or terminate your Account with immediate effect if we reasonably believe your Registration Data is inaccurate, or that the security of your Account has been compromised.</p>
            <p><strong>3.3</strong> You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your Account. Your Account is personal to you and may not be sold, transferred or assigned. If you become aware of any unauthorised use of your Account, please notify us immediately at <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a>; we shall not be liable for unauthorised transactions occurring prior to the expiry of 72 (seventy-two) hours from our receipt of such written notice.</p>
            <p><strong>3.4</strong> You are permitted to maintain only one Account in association with your Registration Data.</p>
          </div>
        </section>

        {/* 4. Nature of Offerings */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">4. NATURE OF THE OFFERINGS AND PROVISION OF SERVICES</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>4.1</strong> Driv A Long operates a technology-based platform that enables Customers to request, and Driver Partners to accept, the Services. Save where a Driver Partner is directly employed by Driv A Long, Driv A Long's role is that of a facilitator connecting Customers with Driver Partners, and the underlying contract for performance of the driving service is between the Customer and the relevant Driver Partner or, where applicable, Driv A Long as service provider.</p>
            <p><strong>4.2</strong> Driv A Long shall use reasonable commercial efforts to confirm a Booking by identifying an available, verified Driver Partner in or around the relevant City of Operation, but does not guarantee the availability of any Driver Partner or any specific Driver Partner for a given Booking.</p>
            <p><strong>4.3</strong> You may be unable to access or use the Offerings during planned downtime for maintenance or upgrades (of which we will use reasonable efforts to notify you in advance), any Force Majeure Event, or the unavailability of Driver Partners. Driv A Long shall not be liable for any inconvenience arising from such unavailability.</p>
            <p><strong>4.4</strong> By using the Offerings, you agree that: (a) you will use the Services for your own lawful, personal or bona fide business use and will not resell or assign the benefit of a Booking to a third party without our consent; (b) your use of the Offerings shall comply with all Applicable Laws; (c) you will not permit any person other than yourself to use your Account without appropriate authorisation; and (d) you will provide Driv A Long with such information as it may reasonably request to complete a Booking safely.</p>
            <p><strong>4.5</strong> Where the Services are provided in conjunction with third parties (including insurers, payment processors, or event and valet vendors engaged by Driv A Long), such Services are subject to the additional terms of those third parties, which shall be made available to you at or before the time of Booking.</p>
          </div>
        </section>

        {/* 5. Booking Confirmation */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">5. BOOKING CONFIRMATION</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>5.1</strong> Upon receiving your Booking request, Driv A Long shall confirm or decline the same based on Driver Partner availability, and shall notify you of the confirmation (including pickup time and location) by SMS, e-mail, or in-app notification.</p>
            <p><strong>5.2</strong> You are responsible for promptly checking your Booking confirmation and for notifying our call centre immediately of any incorrect details. You shall bear the consequences of any delay or deficiency in Service arising from inaccurate information furnished by you.</p>
          </div>
        </section>

        {/* 6. Fees and Payment */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">6. FEES AND PAYMENT</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>6.1</strong> Driv A Long shall provide an estimate of the Fare at the time of Booking. The final Fare payable shall be as reflected at the completion of the Service and may vary from the estimate on account of factors including route, waiting time, traffic conditions, and any extension of the Trip Details requested by you.</p>
            <p><strong>6.2</strong> The total amount payable (Fare, applicable taxes, tolls, parking, interstate permit charges, and any Cancellation Fee) shall be payable by you immediately upon completion of the Service, through the payment modes made available on the Site, which may include payment gateway (debit/credit card, UPI, net-banking), or cash paid directly to the Driver Partner where that option is enabled for your Booking.</p>
            <p><strong>6.3</strong> In the event of default or failure to pay any amount due: (a) Driv A Long may restrict you from making further Bookings until the outstanding amount is cleared; and (b) you shall be liable for all reasonable costs incurred by Driv A Long in recovering such amount, including collection costs and legal fees, to the extent permitted under Applicable Law.</p>
            <p><strong>6.4</strong> You shall provide accurate payment details and authorise Driv A Long and its payment processor(s) to process payments for completed Bookings. Payment-related issues not caused by an error or fault in the Site shall be resolved directly between you and the relevant payment processor or card issuer.</p>
          </div>
        </section>

        {/* 7. Cancellation and Refunds */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">7. CANCELLATION AND REFUNDS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>7.1</strong> You may cancel a Booking at any time prior to completion of the Service, subject to the Cancellation Fee and refund timelines set out in the Driv A Long Refund and Cancellation Policy, available on the Site and incorporated into these User Terms by reference.</p>
            <p><strong>7.2</strong> You will be notified of the applicable Cancellation Fee, if any, before you confirm a cancellation.</p>
          </div>
        </section>

        {/* 8. Customer Conduct & Vehicle Responsibilities */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">8. CUSTOMER REPRESENTATIONS, WARRANTIES AND CONDUCT</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>8.1</strong> Where you make available a vehicle for the Service (for example, a driver-on-demand or pickup-and-drop Booking using your own vehicle), you represent and warrant that: (a) the information you provide is accurate and complete; (b) you hold the legal right to possess and operate the vehicle and it is in good operating condition and meets applicable statutory requirements; (c) you hold a valid insurance policy for the vehicle in accordance with the Motor Vehicles Act, 1988; and (d) you authorise the assigned Driver Partner to operate the vehicle and make reasonable decisions in connection with the Service.</p>
            <p><strong>8.2</strong> You shall remain with your vehicle at all times during the Service unless otherwise agreed, and Driv A Long shall not be liable for any misuse of the vehicle occurring in your absence.</p>
            <p><strong>8.3</strong> You and any accompanying passengers shall behave in a safe, lawful and courteous manner, shall not consume alcohol or prohibited substances in a manner endangering safety, and shall not direct a Driver Partner to violate any Applicable Law. Driv A Long reserves the right to terminate a Service with immediate effect, without refund, for a material breach of this Clause 8.3.</p>
            <p><strong>8.4</strong> You will obey all Applicable Laws relevant to your use of the Offerings and will be solely responsible for any violation thereof.</p>
          </div>
        </section>

        {/* 9. Data and Privacy */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">9. USE OF CUSTOMER DATA AND PRIVACY</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>9.1</strong> Driv A Long collects, uses, and discloses your personal data in accordance with the Driv A Long Privacy Policy. By using the Offerings, you consent to such collection, use and disclosure.</p>
            <p><strong>9.2</strong> You authorise Driv A Long to share relevant Booking and contact information (such as your name, pickup location and contact number) with the Driver Partner assigned to your Booking, solely to enable performance of the Service.</p>
            <p><strong>9.3</strong> You are advised to conduct all communication and payment relating to a Booking through the Site, and to refrain from engaging a Driver Partner directly for services outside the Driv A Long platform. Off-platform engagements are undertaken entirely at your own risk and Driv A Long shall have no liability whatsoever in connection with them.</p>
          </div>
        </section>

        {/* 10. Content Posted by Customers */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">10. CONTENT POSTED BY CUSTOMERS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>10.1</strong> Where the Site permits you to post ratings, reviews, comments, images or other content ("Posted Content"), you represent that you hold all rights necessary to post such content and that it does not infringe any third-party right or Applicable Law.</p>
            <p><strong>10.2</strong> You agree that Posted Content shall be fair, accurate and non-disparaging, and shall not be unlawful, obscene, defamatory, threatening, or discriminatory. Driv A Long may remove any Posted Content at its discretion and is not responsible for, and does not endorse, any Posted Content.</p>
            <p><strong>10.3</strong> You grant Driv A Long a non-exclusive, worldwide, royalty-free licence to use, reproduce and display Posted Content for the purpose of operating, improving and promoting the Offerings.</p>
          </div>
        </section>

        {/* 11. Intellectual Property */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">11. INTELLECTUAL PROPERTY</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>11.1</strong> Driv A Long (and its licensors) alone owns all right, title and interest, including all intellectual property rights, in and to the Offerings, the "Driv A Long" name and logo, and all text, graphics, interfaces, trademarks and computer code comprised in the Site, save for Posted Content and Customer Data as addressed above.</p>
            <p><strong>11.2</strong> Subject to your compliance with these User Terms, Driv A Long grants you a limited, revocable, non-exclusive, non-transferable licence to download and use the Application on a single device for your own personal or bona fide business use.</p>
            <p><strong>11.3</strong> You shall not: (a) license, sell, rent, distribute, or commercially exploit the Site or Application; (b) modify, reverse-engineer, decompile or create derivative works of the Site or Application; (c) use any automated means (bots, scrapers, crawlers) to access the Site; or (d) use Driv A Long's trademarks, logos or branding without prior written consent.</p>
            <p><strong>11.4</strong> These User Terms do not convey to you any ownership interest in the Site, the Application, or the Services, and all rights not expressly granted are reserved to Driv A Long.</p>
          </div>
        </section>

        {/* 12. Limitation of Liability */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">12. DISCLAIMERS AND LIMITATION OF LIABILITY</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>12.1</strong> The Offerings are provided on an "as is" and "as available" basis. Driv A Long does not warrant that the Site will be uninterrupted, error-free, or free of viruses or defects, and does not guarantee the conduct, punctuality, or quality of Services rendered by any Driver Partner engaged otherwise than as a direct employee of Driv A Long.</p>
            <p><strong>12.2</strong> Driv A Long shall not be liable for: (a) your missing a flight, train, event, examination or other time-sensitive commitment, given that the Services are dependent on traffic, weather and other factors outside Driv A Long's control; (b) loss of, or damage to, personal belongings left in a vehicle, save where caused by the proven negligence of a Driver Partner directly employed by Driv A Long; or (c) any indirect, incidental, consequential, or special damages, including loss of profit or business opportunity.</p>
            <p><strong>12.3</strong> Save in cases of proven gross negligence or wilful misconduct on the part of Driv A Long or a Driver Partner directly employed by Driv A Long, Driv A Long's aggregate liability arising out of or in connection with these User Terms, whether in contract, tort or otherwise, shall not exceed the total Fare actually paid by you for the specific Booking giving rise to the claim.</p>
            <p><strong>12.4</strong> Nothing in this Clause 12 shall exclude or limit liability for death or personal injury caused by proven negligence, or for fraud, to the extent such exclusion is not permitted under Applicable Law.</p>
            <p><strong>12.5</strong> Where the Service involves a Driver Partner engaged through a verified independent network rather than as a direct Driv A Long employee, Driv A Long's responsibility is limited to (a) verifying such Driver Partner in accordance with its onboarding protocol, and (b) providing reasonable assistance and available documentation to you in pursuing any claim against the Driver Partner; the initiation and pursuit of legal action against such Driver Partner (including in respect of theft, misconduct or damage) remains your responsibility.</p>
          </div>
        </section>

        {/* 13. Indemnification */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">13. INDEMNIFICATION</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You agree to indemnify, defend and hold harmless Driv A Long, its affiliates, directors, officers, employees and Driver Partners from and against all claims, damages, losses, liabilities and expenses (including reasonable legal costs) arising out of or in connection with: (a) your breach of these User Terms or any Applicable Law; (b) any misrepresentation or inaccurate information furnished by you; (c) any damage caused by you or your accompanying passengers to a vehicle or third-party property; or (d) any unlawful instruction given by you to a Driver Partner.
          </p>
        </section>

        {/* 14. Term and Termination */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">14. TERM AND TERMINATION</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>14.1</strong> These User Terms take effect upon your acceptance and continue until terminated in accordance with this Clause 14.</p>
            <p><strong>14.2</strong> You may terminate these User Terms at any time by deleting your Account through the Site or by written request to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a>.</p>
            <p><strong>14.3</strong> Driv A Long may suspend or terminate your Account and access to the Offerings with immediate effect, without liability, where you breach these User Terms, misuse the Offerings, or where required to comply with Applicable Law.</p>
            <p><strong>14.4</strong> Termination shall not affect either Party's accrued rights or obligations, and Clauses 9, 11, 12, 13, 16 and 17 shall survive termination.</p>
          </div>
        </section>

        {/* 15. Promotions and Communications */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">15. PROMOTIONS AND COMMUNICATIONS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By accepting these User Terms, you consent to receive service-related, transactional and (subject to Applicable Law) promotional communications from Driv A Long via SMS, e-mail, WhatsApp or other channels. You may opt out of promotional communications at any time using the unsubscribe mechanism provided, without affecting transactional communications necessary for the Services.
          </p>
        </section>

        {/* 16. Governing Law and Dispute Resolution */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">16. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>16.1</strong> These User Terms shall be governed by and construed in accordance with the laws of India.</p>
            <p><strong>16.2</strong> The Parties shall first attempt to resolve any dispute through good-faith negotiation within 15 (fifteen) days of written notice.</p>
            <p><strong>16.3</strong> Failing amicable resolution, the dispute shall be referred to and finally resolved by arbitration under the Arbitration and Conciliation Act, 1996, by a sole arbitrator mutually appointed by the Parties. The seat and venue of arbitration shall be Thrissur, Kerala, and the arbitration shall be conducted in English. The arbitral award shall be final and binding.</p>
            <p><strong>16.4</strong> Subject to Clause 16.3, the courts at Thrissur, Kerala shall have exclusive jurisdiction over all matters ancillary to the arbitration and any matter not covered by the arbitration agreement, including consumer disputes to the extent the Consumer Protection Act, 2019 does not mandatorily confer jurisdiction elsewhere.</p>
          </div>
        </section>

        {/* 17. Miscellaneous */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">17. MISCELLANEOUS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>17.1 Force Majeure:</strong> Neither Party shall be liable for delay or failure in performance caused by events beyond its reasonable control, including natural disasters, pandemics, strikes, or government orders ("Force Majeure Event"), provided the affected Party promptly notifies the other and uses reasonable efforts to mitigate the impact.</p>
            <p><strong>17.2 Modification:</strong> Driv A Long may modify these User Terms at its discretion by posting the revised version on the Site. Material changes will, where feasible, be notified to you in advance. Your continued use of the Offerings following such changes constitutes acceptance of the revised User Terms.</p>
            <p><strong>17.3 Assignment:</strong> You may not assign your rights under these User Terms without Driv A Long's prior written consent. Driv A Long may assign its rights to any affiliate or successor entity.</p>
            <p><strong>17.4 Severability:</strong> If any provision of these User Terms is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            <p><strong>17.5 Entire Agreement:</strong> These User Terms, together with the Privacy Policy and the Refund and Cancellation Policy, constitute the entire agreement between you and Driv A Long regarding the Offerings.</p>
            <p><strong>17.6 Notices:</strong> Notices to Driv A Long may be sent to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a> or to the registered office at 13/420/1BT1, Tower-A, 1st Floor, Alfa Horizon, Vallarpadam, Ernakulam, Kerala – 682504, India. Driv A Long may give notice by e-mail, SMS, or a general notice on the Site.</p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
