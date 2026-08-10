/**
 * Driv A Long Private Limited — Ride Summary Receipt Generator
 * Generates and downloads an official printable HTML/document receipt for chauffeur bookings.
 */

export interface RideSummaryData {
  bookingId: string;
  serviceType: string;
  pickup: string;
  destination?: string;
  bookingDate?: string;
  bookingTime?: string;
  duration?: string;
  transmission?: string;
  estimatedFare?: string | number;
  driverName?: string;
  driverPhone?: string;
  status?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export function downloadRideSummaryReceipt(data: RideSummaryData) {
  const formattedFare =
    typeof data.estimatedFare === "number"
      ? `₹${data.estimatedFare.toLocaleString("en-IN")}`
      : data.estimatedFare || "₹797";

  const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ride Summary Receipt - ${data.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #f8fafc; color: #0f172a; }
    .receipt-card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b2d7a; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #0b2d7a; letter-spacing: -0.5px; }
    .brand span { color: #f4b400; }
    .booking-id { font-family: monospace; font-size: 14px; font-weight: 700; background: #ebf1ff; color: #1e5ae8; padding: 6px 14px; border-radius: 99px; }
    .status-badge { display: inline-block; font-size: 12px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 99px; margin-bottom: 20px; border: 1px solid #fde68a; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 4px; }
    .fare-box { background: #0b2d7a; color: #ffffff; padding: 20px 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
    .fare-amount { font-size: 24px; font-weight: 800; color: #f4b400; }
    .notice { font-size: 12px; color: #475569; background: #f1f5f9; padding: 16px; border-radius: 12px; margin-top: 24px; line-height: 1.5; border-left: 4px solid #1e5ae8; }
    .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-card { border: none; shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div class="brand">Driv A Long <span>Private Limited</span></div>
      <div class="booking-id">${data.bookingId}</div>
    </div>

    <div class="status-badge">
      🟡 Status: ${data.status || "Pending WhatsApp Approval (+91 7306605416)"}
    </div>

    <div class="grid">
      <div>
        <div class="label">Service Type</div>
        <div class="value">${data.serviceType}</div>
      </div>
      <div>
        <div class="label">Duration</div>
        <div class="value">${data.duration || "4 Hours"}</div>
      </div>
      <div>
        <div class="label">Pickup Address</div>
        <div class="value">${data.pickup}</div>
      </div>
      <div>
        <div class="label">Destination</div>
        <div class="value">${data.destination || "Flexible / Hourly Route"}</div>
      </div>
      <div>
        <div class="label">Date & Scheduled Time</div>
        <div class="value">${data.bookingDate || "Immediate"} ${data.bookingTime ? `at ${data.bookingTime}` : ""}</div>
      </div>
      <div>
        <div class="label">Transmission Type</div>
        <div class="value">${data.transmission || "Automatic"} Transmission</div>
      </div>
      <div>
        <div class="label">Assigned Chauffeur</div>
        <div class="value">${data.driverName && !data.driverName.includes("Rajesh") ? data.driverName : "Pending Admin Approval"}</div>
      </div>
      <div>
        <div class="label">For Any Issues / Contact Us</div>
        <div class="value">+91 7306605416</div>
      </div>
    </div>

    <div class="fare-box">
      <div>
        <div style="font-size:12px; font-weight:600; opacity:0.9;">Estimated Fare</div>
        <div style="font-size:11px; opacity:0.7;">Taxes & Service Charge Included</div>
      </div>
      <div class="fare-amount">${formattedFare}</div>
    </div>

    <div class="notice">
      <strong>Payment & Confirmation Notice:</strong><br/>
      Bookings and payments are manually confirmed by our team via WhatsApp. The admin/owner will verify your ride details and contact you directly on <strong>+91 7306605416</strong> on WhatsApp to complete payment and dispatch your chauffeur.
    </div>

    <div class="footer">
      Driv A Long Private Limited · Your Driver, Your Car · Official Chauffeur Service<br/>
      Support: info@drivalong.com · WhatsApp: +91 7306605416
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;

  const blob = new Blob([receiptHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");

  if (!win) {
    // Fallback if popups are blocked
    const a = document.createElement("a");
    a.href = url;
    a.download = `DrivALong_Ride_Summary_${data.bookingId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
