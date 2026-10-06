import { createFileRoute, Link } from "@tanstack/react-router";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { useAuthUser } from "@/lib/auth";
import { Lock, ShieldCheck, LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Chauffeur — Driv A Long Private Limited" },
      { name: "description", content: "Book a professional chauffeur in five easy steps. Transparent pricing, verified drivers, live tracking." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { user } = useAuthUser();

  if (!user) {
    return (
      <div className="bg-subtle py-12 sm:py-16 md:py-20 w-full min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="container-px mx-auto max-w-lg w-full text-center">
          <div className="rounded-[28px] border border-border bg-background p-8 sm:p-10 shadow-lift space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-8 w-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                <ShieldCheck className="h-3.5 w-3.5" /> Customer Login Required
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Sign In to Book a Chauffeur
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                To guarantee verified driver allocation, safety compliance, and live trip tracking in your dashboard, you must be logged in to a customer account before booking a chauffeur.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/login"
                search={{ redirect: "/book" }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 active:scale-98 transition-all"
              >
                <LogIn className="h-4 w-4" />
                Sign In to Book
              </Link>
              <Link
                to="/signup"
                search={{ redirect: "/book" }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground shadow-sm hover:bg-muted active:scale-98 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </Link>
            </div>

            <div className="border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                Already have an active trip? View your{" "}
                <Link to="/dashboard" className="text-primary font-semibold hover:underline">
                  Customer Dashboard
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-subtle py-6 sm:py-8 md:py-14 w-full max-w-full overflow-x-hidden">
      <div className="container-px mx-auto max-w-5xl w-full min-w-0">
        <BookingWizard />
      </div>
    </div>
  );
}
