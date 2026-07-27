import { createFileRoute } from "@tanstack/react-router";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Chauffeur — Driv A Long" },
      { name: "description", content: "Book a professional chauffeur in five easy steps. Transparent pricing, verified drivers, live tracking." },
    ],
  }),
  component: () => (
    <div className="bg-subtle py-8 md:py-14">
      <div className="container-px mx-auto max-w-5xl">
        <BookingWizard />
      </div>
    </div>
  ),
});
