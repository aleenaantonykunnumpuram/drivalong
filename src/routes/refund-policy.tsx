import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { RotateCcw, Clock, CheckCircle2, AlertTriangle, CreditCard, Banknote } from "lucide-react";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund and Cancellation Policy — Driv A Long Private Limited" },
      {
        name: "description",
        content:
          "Driv A Long Private Limited Refund and Cancellation Policy. Official rules on booking cancellations, fee schedules, driver delay waivers, and refund timelines.",
      },
    ],
  }),
  component: RefundPolicyPage,
});

export function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="Fair, Transparent Cancellation Rules & Timelines — Driv A Long Private Limited"
      activeTab="refund"
    >
      <div className="space-y-8 text-sm">
        {/* Document Header Metadata */}
        <div className="border-b border-border pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Corporate Identification Number: <strong className="text-foreground">U52291KL2026PTC104826</strong></span>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-600">Last updated: October 2026</span>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-foreground leading-relaxed">
            This Refund and Cancellation Policy applies to Bookings made through Driv A Long Site and forms part of, and should be read together with, the <strong>Driv A Long User Terms and Conditions</strong>.
          </div>
        </div>

        {/* 1. Cancellation by the Customer */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">1. CANCELLATION BY THE CUSTOMER</h2>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p><strong>1.1</strong> You may cancel a confirmed Booking at any time prior to completion of the Service, through the Application or by written intimation to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a>.</p>

            <div className="rounded-2xl border border-border bg-subtle/50 p-4 space-y-2 text-foreground">
              <strong className="text-xs uppercase tracking-wider text-primary block">1.2 Cancellation Fee Structure:</strong>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                <li><strong>(a) Free Cancellation:</strong> No Cancellation Fee if you cancel within <strong>2 (two) minutes</strong> of a Driver Partner being allotted.</li>
                <li><strong>(b) Post-Allotment Cancellation:</strong> A Cancellation Fee equal to a fixed minimum charge, as displayed on the Application at the time of cancellation, if you cancel after 2 (two) minutes of allotment but before the Driver Partner arrives.</li>
                <li><strong>(c) Driver Arrived & Waited:</strong> If the Driver Partner has already arrived at the pickup location and waited for more than <strong>10 (ten) minutes</strong>, the full estimated Fare then applicable may be charged as a Cancellation Fee.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-foreground flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <p>
                <strong>1.3 Driver Delay Protection:</strong> Notwithstanding Clause 1.2, if the Driver Partner is delayed by more than <strong>10 (ten) minutes beyond the scheduled pickup time</strong>, you shall <strong>NOT</strong> be charged any Cancellation Fee for cancelling that Booking.
              </p>
            </div>

            <p><strong>1.4</strong> You will be notified of the applicable Cancellation Fee before you confirm a cancellation. The Cancellation Fee shall be exclusive of applicable taxes and shall be payable at the time of, or adjusted against, your next Booking.</p>

            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-foreground flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              <p>
                <strong>1.5 No-show:</strong> If you or an authorised passenger fail to report at the pickup point within <strong>30 (thirty) minutes</strong> of the scheduled time without prior intimation, the Booking will be treated as a no-show and the full estimated Fare shall stand forfeited as a Cancellation Fee.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Cancellation by Driv A Long */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">2. CANCELLATION BY DRIV A LONG</h2>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground leading-relaxed">
            Where Driv A Long is unable to perform a confirmed Booking for reasons attributable to Driv A Long (including the unavailability of a verified Driver Partner), Driv A Long shall <strong>refund the entire amount paid by you within 7 (seven) business days, without deduction</strong>, unless you elect to reschedule the Booking instead.
          </div>
        </section>

        {/* 3. Meter Start Policy */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">3. METER START POLICY</h2>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-subtle/50 p-4 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              A Driver Partner will wait no more than <strong>15 (fifteen) minutes</strong> from the requested trip-start time before starting the trip timer for billing purposes.
            </p>
          </div>
        </section>

        {/* 4. Refund Requests */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">4. REFUND REQUESTS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>4.1</strong> If you believe an amount has been incorrectly debited or charged, please write to <a href="mailto:info@drivalong.com" className="text-primary font-semibold">info@drivalong.com</a> with details of the transaction and the basis of your refund request.</p>
            <p><strong>4.2</strong> Where Driv A Long determines that a refund request is valid, it shall make reasonable efforts to process the refund to the original mode of payment, or, if that is not possible, to such other mode as may be agreed with you.</p>
            <p><strong>4.3</strong> Driv A Long shall use reasonable efforts to respond to refund requests promptly, but shall not be responsible for delays caused by third parties (such as banks or payment gateway providers) or by a Force Majeure Event, and bears no liability for the processing time taken by such third parties.</p>
          </div>
        </section>

        {/* 5. Indicative Refund Timelines */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">5. INDICATIVE REFUND TIMELINES</h2>
          <p className="text-xs text-muted-foreground">
            Once approved, refunds are typically credited to the original payment method within the following indicative timelines, subject to the policies of the relevant bank or payment processor:
          </p>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-subtle text-foreground font-bold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Typical Processing Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-500" /> UPI
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">1 – 2 business days</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" /> Debit / Credit Cards
                  </td>
                  <td className="px-4 py-3">5 – 7 business days</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">Net Banking</td>
                  <td className="px-4 py-3">5 – 7 business days</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">Other Supported Wallets</td>
                  <td className="px-4 py-3">5 – 7 business days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Chargebacks */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">6. CHARGEBACKS</h2>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p><strong>6.1</strong> You may have the right to initiate a chargeback in accordance with the terms of your card scheme or bank. A chargeback request is processed by your card issuer or bank, and not by Driv A Long; Driv A Long bears no liability for the processing of chargeback requests.</p>
            <p><strong>6.2</strong> Driv A Long reserves the right to review your Account and transaction history in connection with a chargeback request to assess potential fraud, and may suspend or terminate your Account with immediate effect if fraudulent activity is reasonably suspected.</p>
          </div>
        </section>

        {/* 7. Non-Refundable Amounts */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">7. NON-REFUNDABLE AMOUNTS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Save as set out in this Policy, amounts paid towards a completed Service are final and non-refundable. Cancellation Fees validly charged in accordance with Clause 1 are non-refundable.
          </p>
        </section>

        {/* 8. Amendments */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">8. AMENDMENTS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Driv A Long may amend this Policy from time to time by posting the updated version on the Site. The revised Policy shall apply prospectively to Bookings made after the date of such update.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
