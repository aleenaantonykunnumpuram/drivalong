import { createFileRoute } from "@tanstack/react-router";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Chauffeur — Driv A Long Private Limited" },
      { name: "description", content: "Book a professional chauffeur in five easy steps. Transparent pricing, verified drivers, live tracking." },
    ],
  }),
  component: () => (
    <div className="bg-subtle py-6 sm:py-8 md:py-14 w-full max-w-full overflow-x-hidden">
      <div className="container-px mx-auto max-w-5xl w-full min-w-0">
        <BookingWizard />
      </div>
    </div>
  ),
});
