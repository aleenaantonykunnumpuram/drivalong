import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, MapPin, UserCheck, Download, Navigation, XCircle, RefreshCw, CheckCircle2, Star, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Customer Dashboard — Driv A Long" }],
  }),
  component: CustomerDashboard,
});

interface BookingItem {
  id: string;
  serviceType: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  driverName: string;
  driverPhone: string;
  status: "Assigned" | "In Progress" | "Completed" | "Cancelled";
}

const mockBookings: BookingItem[] = [
  {
    id: "DAL20260730001",
    serviceType: "Hourly Chauffeur",
    pickup: "Indiranagar 100ft Road, Bengaluru",
    destination: "Flexible / Shopping Stops",
    date: "Today, 30 Jul 2026",
    time: "18:30",
    duration: "4 Hours",
    price: "₹909",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 43210",
    status: "Assigned",
  },
  {
    id: "DAL20260728088",
    serviceType: "Airport Chauffeur",
    pickup: "Koramangala 4th Block, Bengaluru",
    destination: "Kempegowda International Airport",
    date: "28 Jul 2026",
    time: "05:00",
    duration: "2 Hours",
    price: "₹799",
    driverName: "Suresh Babu",
    driverPhone: "+91 98450 11223",
    status: "Completed",
  },
  {
    id: "DAL20260725042",
    serviceType: "Outstation Chauffeur",
    pickup: "Whitefield Main Road, Bengaluru",
    destination: "Mysuru Palace, Mysuru",
    date: "25 Jul 2026",
    time: "06:00",
    duration: "12 Hours",
    price: "₹2,499",
    driverName: "Vikram Singh",
    driverPhone: "+91 97312 99887",
    status: "Completed",
  },
];

function CustomerDashboard() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [bookings, setBookings] = useState<BookingItem[]>(mockBookings);

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)));
    toast.success(`Booking ${id} cancelled successfully.`);
  };

  const handleReschedule = (id: string) => {
    toast.info(`Reschedule request initiated for ${id}. Select new time.`);
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Invoice for ${id} downloaded.`);
  };

  const upcomingList = bookings.filter((b) => b.status === "Assigned" || b.status === "In Progress");
  const historyList = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled");
  const activeList = tab === "upcoming" ? upcomingList : historyList;

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Your Driver, Your Car</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Customer Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your chauffeur bookings, track drivers, and view trip history.</p>
        </div>
        <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
          Book New Chauffeur <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="inline-flex rounded-2xl bg-muted p-1 text-sm font-medium">
        <button
          onClick={() => setTab("upcoming")}
          className={`rounded-xl px-5 py-2.5 transition ${tab === "upcoming" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}
        >
          Upcoming Bookings ({upcomingList.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`rounded-xl px-5 py-2.5 transition ${tab === "history" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}
        >
          Booking History ({historyList.length})
        </button>
      </div>

      {activeList.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background p-12 text-center space-y-3">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No bookings found</h3>
          <p className="text-xs text-muted-foreground">You have no {tab} chauffeur bookings at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeList.map((b) => (
            <div key={b.id} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{b.id}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    b.status === "Assigned" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" :
                    b.status === "Completed" ? "bg-blue-500/10 text-blue-600" : "bg-destructive/10 text-destructive"
                  }`}>
                    <CheckCircle2 className="h-3 w-3" /> {b.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground">{b.serviceType}</h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{b.duration} · {b.price}</p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-muted-foreground uppercase text-[10px]">Pickup</span>
                      <p className="font-medium text-foreground">{b.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-muted-foreground uppercase text-[10px]">Destination</span>
                      <p className="font-medium text-foreground">{b.destination}</p>
                    </div>
                  </div>
                </div>

                {b.status === "Assigned" && (
                  <div className="rounded-2xl bg-subtle p-3 text-xs space-y-1">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-primary" /> Driver: {b.driverName}
                    </div>
                    <p className="text-muted-foreground text-[11px]">Phone: {b.driverPhone} · En Route</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2">
                {b.status === "Assigned" ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleReschedule(b.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold hover:bg-muted"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                    <button
                      onClick={() => toast.success(`Tracking live driver location for ${b.id}...`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:brightness-110"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Track Assigned Driver
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDownloadInvoice(b.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-subtle py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
