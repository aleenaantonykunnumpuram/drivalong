import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { UserCheck, MapPin, Navigation, Clock, CheckCircle2, Phone, Play, CheckSquare, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [{ title: "Driver Portal — Driv A Long Private Limited" }],
  }),
  component: DriverPortal,
});

interface DriverTask {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  pickup: string;
  destination: string;
  time: string;
  duration: string;
  transmission: string;
  price: string;
  status: "Pending Accept" | "En Route" | "In Progress" | "Completed";
}

const mockTasks: DriverTask[] = [
  {
    id: "DAL20260730001",
    customerName: "Anand Verma",
    customerPhone: "+91 98450 12345",
    serviceType: "Hourly Chauffeur",
    pickup: "Indiranagar 100ft Road, Bengaluru",
    destination: "Flexible / Shopping Stops",
    time: "18:30 Today",
    duration: "4 Hours",
    transmission: "Automatic",
    price: "₹909",
    status: "Pending Accept",
  },
  {
    id: "DAL20260730004",
    customerName: "Meera Nair",
    customerPhone: "+91 98888 77766",
    serviceType: "Airport Chauffeur",
    pickup: "Jayanagar 4th Block, Bengaluru",
    destination: "Kempegowda International Airport",
    time: "21:00 Today",
    duration: "2 Hours",
    transmission: "Manual",
    price: "₹799",
    status: "Pending Accept",
  },
];

const API_BASE = "http://127.0.0.1:5000";

function DriverPortal() {
  const { user } = useAuthUser();
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDriverStatus, setActiveDriverStatus] = useState<"Online" | "Offline">("Online");

  const fetchDriverTrips = () => {
    if (!user) return;
    setLoading(true);
    const queryParam = user.role === "admin" ? "" : `?driverEmail=${encodeURIComponent(user.email)}`;
    fetch(`${API_BASE}/api/bookings${queryParam}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.trips) {
          const mapped: DriverTask[] = res.trips.map((t: any) => ({
            id: t.bookingId,
            customerName: t.customerName || t.customerEmail || "Customer",
            customerPhone: t.customerPhone || "+91 98000 00000",
            serviceType: t.serviceType || "Hourly Chauffeur",
            pickup: t.pickup?.address || "Pickup Location",
            destination: t.drop?.address || "Flexible / Hourly Route",
            time: `${t.bookingDate || "Today"} ${t.bookingTime || ""}`,
            duration: t.duration || "4 Hours",
            transmission: t.transmission || "Automatic",
            price: t.estimatedPrice || t.fare?.totalFare ? `₹${t.estimatedPrice || t.fare?.totalFare}` : "Fare Upon Pickup",
            status: (t.bookingStatus === "Pending" ? "Pending Accept" : t.bookingStatus) as any,
          }));
          setTasks(mapped);
        }
      })
      .catch((err) => console.error("Failed to load driver trips:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDriverTrips();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: DriverTask["status"]) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          bookingStatus: newStatus,
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Booking ${id} status updated to: ${newStatus}`);
        fetchDriverTrips();
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to database server.");
    }
  };

  if (!user || (user.role !== "rider" && user.role !== "admin")) {
    return (
      <div className="container-px mx-auto max-w-4xl py-16 text-center space-y-6 animate-rise">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Lock className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Access Required</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Please log in with a registered Driver (Rider) account created by the Administrator to access your driver portal.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
          >
            Sign In as Driver
          </Link>
        </div>
      </div>
    );
  }

  const driverInitial = user.name ? user.name.charAt(0).toUpperCase() : "D";

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {driverInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{user.name}</h1>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                Verified Chauffeur ({user.role})
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Email: {user.email} {user.phone ? `· Phone: ${user.phone}` : ""} · Certified Automatic & Manual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">Driver Status:</span>
          <button
            onClick={() => setActiveDriverStatus((s) => (s === "Online" ? "Offline" : "Online"))}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              activeDriverStatus === "Online" ? "bg-emerald-500 text-white shadow-soft" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> {activeDriverStatus}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">Today's Schedule & Assigned Rides</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Accept bookings, navigate to pickup, and start service for the customer's vehicle.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-mono text-xs font-bold text-primary">{task.id}</span>
                <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold">
                  {task.status}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{task.serviceType}</span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">{task.customerName}</h3>
                <p className="text-xs text-muted-foreground">Phone: {task.customerPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-subtle p-3 rounded-2xl text-xs font-medium">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase">Duration</span>
                  <p className="font-semibold text-foreground">{task.duration}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase">Transmission</span>
                  <p className="font-semibold text-foreground capitalize">{task.transmission} Car</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase">Scheduled Time</span>
                  <p className="font-semibold text-foreground">{task.time}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase">Payout</span>
                  <p className="font-bold text-emerald-600 text-sm">{task.price}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">Pickup</span>
                    <p className="font-medium text-foreground">{task.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">Destination</span>
                    <p className="font-medium text-foreground">{task.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 space-y-2">
              {task.status === "Pending Accept" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(task.id, "En Route")}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Accept Booking
                  </button>
                  <button
                    onClick={() => toast.error("Booking declined")}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-subtle py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Decline
                  </button>
                </div>
              )}

              {task.status === "En Route" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toast.success(`Launching Google Maps navigation to ${task.pickup}...`)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-subtle py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Navigation className="h-4 w-4 text-primary" /> Navigate Pickup
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(task.id, "In Progress")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-soft hover:brightness-110"
                  >
                    <Play className="h-4 w-4" /> Start Service
                  </button>
                </div>
              )}

              {task.status === "In Progress" && (
                <button
                  onClick={() => handleUpdateStatus(task.id, "Completed")}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-soft hover:brightness-110"
                >
                  <CheckSquare className="h-4 w-4" /> Complete Service
                </button>
              )}

              {task.status === "Completed" && (
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-center text-xs font-bold text-emerald-600">
                  ✓ Service Completed Successfully
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
