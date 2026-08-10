import React from "react";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 2.159.685 4.158 1.854 5.795L2.5 21.5l3.829-1.326A9.952 9.952 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zM4 12a8 8 0 1114.93 4.005.996.996 0 01.129.539l.608 2.433-2.433-.608a.996.996 0 01-.539-.129A8 8 0 014 12z"/>
    </svg>
  );
}

export function createWhatsAppSupportUrl(options?: {
  pageName?: string;
  booking?: {
    service?: string;
    pickup?: string;
    destination?: string;
    date?: string;
    time?: string;
  };
}) {
  const phone = "917306605416";

  if (options?.booking && (options.booking.service || options.booking.pickup)) {
    const b = options.booking;
    const msg = [
      "Hello Driv A Long Team,",
      "",
      "I have a question regarding my booking.",
      "",
      b.service ? `Service:\n${b.service}` : "",
      b.pickup ? `Pickup:\n${b.pickup}` : "",
      b.destination ? `Destination:\n${b.destination}` : "",
      b.date ? `Date:\n${b.date}` : "",
      b.time ? `Time:\n${b.time}` : "",
      "",
      "Please assist me.",
      "",
      "Thank you."
    ].filter(line => line !== undefined).join("\n").replace(/\n{3,}/g, "\n\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  if (options?.pageName) {
    const msg = [
      "Hello Driv A Long Team,",
      "",
      "I visited your website and I have a few questions.",
      "",
      `Page:\n${options.pageName}`,
      "",
      "Could you please assist me?",
      "",
      "Thank you."
    ].join("\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  const defaultMsg = [
    "Hello Driv A Long Team,",
    "",
    "I visited your website and I have a few questions about your chauffeur services.",
    "",
    "Could you please assist me?",
    "",
    "Thank you."
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(defaultMsg)}`;
}
