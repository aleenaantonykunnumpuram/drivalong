import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, UserCheck, Calendar, DollarSign, Award, CheckCircle2, Search, Filter, ShieldCheck, ArrowRight, Settings } from "lucide-react";
import { toast } from "sonner";
import { CHAUFFEUR_SERVICES } from "@/lib/pricing";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Management Panel — Driv A Long" }],
  }),
  component: AdminPanel,
});

interface AdminBooking {
  id: string;
  customer: string;
  driver: string;
  serviceType: string;
  pickup: string;
  duration: string;
  price: string;
  status: "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
}

const initialBookings: AdminBooking[] = [
  {
    id: "DAL20260730001",
    customer: "Anand Verma",
    driver: "Rajesh Kumar",
    serviceType: "Hourly Chauffeur",
    pickup: "Indiranagar, Bengaluru",
    duration: "4 Hours",
    price: "₹909",
    status: "Assigned",
  },
  {
    id: "DAL20260730002",
    customer: "Priya Sharma",
    driver: "Unassigned",
    serviceType: "Full-Day Chauffeur",
    pickup: "Koramangala, Bengaluru",
    duration: "8 Hours",
    price: "₹1,499",
    status: "Pending",
  },
  {
    id: "DAL20260730003",
    customer: "Vikram Mehta",
    driver: "Suresh Babu",
    serviceType: "Designated Driver",
    pickup: "MG Road, Bengaluru",
    duration: "2 Hours",
    price: "₹659",
    status: "Completed",
  },
];

function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"bookings" | "drivers" | "customers" | "services" | "revenue">("bookings");
  const [bookings, setBookings] = useState<AdminBooking[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");

  const drivers = [
    { name: "Rajesh Kumar", phone: "+91 98765 43210", rating: "4.98★", status: "Active (On Job)", totalTrips: 420 },
    { name: "Suresh Babu", phone: "+91 98450 11223", rating: "4.92★", status: "Active (Available)", totalTrips: 310 },
    { name: "Vikram Singh", phone: "+91 97312 99887", rating: "4.95★", status: "Active (Available)", totalTrips: 280 },
  ];

  const customers = [
    { name: "Anand Verma", email: "anand.verma@example.com", phone: "+91 98450 12345", bookings: 12 },
    { name: "Priya Sharma", email: "priya.sharma@example.com", phone: "+91 98765 67890", bookings: 8 },
    { name: "Vikram Mehta", email: "vikram.m@example.com", phone: "+91 99001 12233", bookings: 5 },
  ];

  const handleAssignDriver = (id: string, driverName: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, driver: driverName, status: "Assigned" } : b)));
    toast.success(`Assigned driver ${driverName} to booking ${id}`);
  };

  const handleStatusChange = (id: string, status: AdminBooking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Booking ${id} status updated to ${status}`);
  };

  const filteredBookings = bookings.filter((b) =>
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Chauffeur Platform Control Center</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage bookings, assign chauffeurs, monitor revenue, and oversee service catalog.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Bookings", val: "1,248", icon: Calendar, color: "text-primary" },
          { label: "Active Drivers", val: "142", icon: UserCheck, color: "text-emerald-600" },
          { label: "Registered Customers", val: "3,890", icon: Users, color: "text-blue-600" },
          { label: "Total Revenue", val: "₹18,45,900", icon: DollarSign, color: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="rounded-3xl border border-border bg-background p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3 text-sm font-semibold">
        {(["bookings", "drivers", "customers", "services", "revenue"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-2xl px-4 py-2.5 capitalize transition ${
              activeTab === t ? "bg-primary text-primary-foreground shadow-soft" : "bg-subtle text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search booking ID, customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition">
                      <td className="p-4 font-mono font-bold text-primary">{b.id}</td>
                      <td className="p-4 font-medium text-foreground">{b.customer}</td>
                      <td className="p-4 font-semibold">{b.serviceType}</td>
                      <td className="p-4 text-muted-foreground">{b.duration}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${b.driver === "Unassigned" ? "text-amber-600" : "text-foreground"}`}>
                          {b.driver}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground">{b.price}</td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          b.status === "Assigned" ? "bg-emerald-500/10 text-emerald-600" :
                          b.status === "Pending" ? "bg-amber-500/10 text-amber-600" :
                          b.status === "Completed" ? "bg-blue-500/10 text-blue-600" : "bg-destructive/10 text-destructive"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {b.driver === "Unassigned" && (
                          <button
                            onClick={() => handleAssignDriver(b.id, "Suresh Babu")}
                            className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft hover:brightness-110"
                          >
                            Assign Suresh
                          </button>
                        )}
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as AdminBooking["status"])}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-medium outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === "drivers" && (
        <div className="grid gap-4 md:grid-cols-3">
          {drivers.map((d, i) => (
            <div key={i} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary font-bold text-base">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{d.name}</h3>
                  <p className="text-xs text-muted-foreground">{d.phone}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 text-xs space-y-1.5 text-muted-foreground">
                <div className="flex justify-between"><span>Rating</span><span className="font-bold text-foreground">{d.rating}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="font-semibold text-emerald-600">{d.status}</span></div>
                <div className="flex justify-between"><span>Total Trips</span><span className="font-bold text-foreground">{d.totalTrips}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="grid gap-4 md:grid-cols-3">
          {customers.map((c, i) => (
            <div key={i} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-subtle text-foreground font-bold text-base">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 text-xs space-y-1.5 text-muted-foreground">
                <div className="flex justify-between"><span>Phone</span><span className="font-medium text-foreground">{c.phone}</span></div>
                <div className="flex justify-between"><span>Completed Bookings</span><span className="font-bold text-primary">{c.bookings}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services Catalog Tab */}
      {activeTab === "services" && (
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(CHAUFFEUR_SERVICES).map(([key, s]) => (
            <div key={key} className="rounded-3xl border border-border bg-background p-5 shadow-soft space-y-2">
              <h3 className="font-bold text-base text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              <div className="border-t border-border pt-2 text-xs font-semibold text-primary">
                Base: ₹{s.baseFare} · ₹{s.ratePerHour}/hr
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="rounded-3xl border border-border bg-background p-8 shadow-soft space-y-4 text-center max-w-xl mx-auto">
          <DollarSign className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-bold">Total Platform Revenue</h2>
          <div className="text-4xl font-bold text-primary">₹18,45,900</div>
          <p className="text-xs text-muted-foreground">Calculated across 1,248 completed chauffeur bookings.</p>
        </div>
      )}
    </div>
  );
}
