import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, UserCheck, Calendar, DollarSign, Award, CheckCircle2, Search, Filter, ShieldCheck, ArrowRight, Settings, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CHAUFFEUR_SERVICES } from "@/lib/pricing";
import { useAuthUser } from "@/lib/auth";
import { getAllBookingsFn } from "@/lib/api/trip.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Management Panel — Driv A Long" }],
  }),
  component: AdminPanel,
});

interface AdminBooking {
  id: string;
  customer: string;
  customerEmail: string;
  driver: string;
  serviceType: string;
  pickup: string;
  duration: string;
  price: string;
  rawPrice: number;
  status: "Pending" | "Approved" | "Declined" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  declineReason?: string;
}

interface CustomerAccount {
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface DriverAccount {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

const API_BASE = "http://127.0.0.1:5000";

function AdminPanel() {
  const { user } = useAuthUser();
  const [activeTab, setActiveTab] = useState<"bookings" | "drivers" | "customers" | "services" | "revenue">("bookings");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Decline Modal State
  const [declineModalBooking, setDeclineModalBooking] = useState<AdminBooking | null>(null);
  const [declineReasonText, setDeclineReasonText] = useState("");

  // Add Driver Form State
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverEmail, setNewDriverEmail] = useState("");
  const [newDriverPassword, setNewDriverPassword] = useState("");
  const [newDriverPhone, setNewDriverPhone] = useState("");
  const [submittingDriver, setSubmittingDriver] = useState(false);

  const fetchDrivers = () => {
    fetch(`${API_BASE}/api/drivers`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.drivers) {
          setDrivers(res.drivers);
          try {
            const driverEmails = res.drivers.map((d: any) => d.email.toLowerCase().trim());
            localStorage.setItem("drivalong_registered_drivers", JSON.stringify(driverEmails));
          } catch {}
        }
      })
      .catch((err) => console.error("Failed to load drivers:", err));
  };

  const fetchBookings = () => {
    getAllBookingsFn()
      .then((res) => {
        if (res.success && res.trips) {
          const mapped: AdminBooking[] = res.trips.map((t: any) => {
            const rawVal = t.estimatedPrice || t.fare?.totalFare || 797;
            let st = t.bookingStatus || "Pending";
            if (t.status === "declined" || st === "Declined") st = "Declined";
            else if (t.status === "approved" && st === "Pending") st = "Approved";

            return {
              id: t.bookingId,
              customer: t.customerName || t.customerEmail || "Guest Customer",
              customerEmail: t.customerEmail || "",
              driver: t.driverName || "Unassigned",
              serviceType: t.serviceType || "Hourly Chauffeur",
              pickup: t.pickup?.address || "Pickup Location",
              duration: t.duration || "4 Hours",
              price: `₹${rawVal}`,
              rawPrice: Number(rawVal) || 0,
              status: st as any,
              declineReason: t.declineReason || "",
            };
          });
          setBookings(mapped);
        }
      })
      .catch((err) => console.error("Failed to load admin bookings:", err));
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchBookings();

    // Fetch customers from REST API endpoint
    fetch(`${API_BASE}/api/customers`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.customers) {
          setCustomers(res.customers);
        }
      })
      .catch((err) => console.error("Failed to load customers:", err));

    // Fetch drivers from REST API endpoint
    fetchDrivers();
    setLoading(false);
  }, [user]);

  const handleAddDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverEmail || !newDriverPassword || !newDriverPhone) {
      toast.error("Please fill in all required driver details.");
      return;
    }

    setSubmittingDriver(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDriverName,
          email: newDriverEmail,
          password: newDriverPassword,
          phone: newDriverPhone,
          role: "rider",
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Driver ${newDriverName} created in MongoDB with Rider role!`);
        setShowAddDriverModal(false);
        setNewDriverName("");
        setNewDriverEmail("");
        setNewDriverPassword("");
        setNewDriverPhone("");
        fetchDrivers();
      } else {
        toast.error(res.message || "Failed to create driver account.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error connecting to database server.");
    } finally {
      setSubmittingDriver(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container-px mx-auto max-w-4xl py-16 text-center space-y-6 animate-rise">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-destructive/10 text-destructive border border-destructive/20">
          <Lock className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Access Restricted</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            This area requires single System Administrator privileges. Please log in with valid admin credentials.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login" search={{ redirect: "/admin" }} className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
            Sign In as Admin
          </Link>
          <Link to="/" className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleAssignDriver = async (bookingId: string, driverEmail: string) => {
    const selectedDriver = drivers.find((d) => d.email === driverEmail);
    if (!selectedDriver) {
      toast.error("Please select a valid registered driver.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          driverName: selectedDriver.name,
          driverEmail: selectedDriver.email,
          driverPhone: selectedDriver.phone,
          bookingStatus: "Assigned",
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Assigned driver ${selectedDriver.name} to booking ${bookingId}`);
        fetchBookings();
      } else {
        toast.error(res.message || "Failed to assign driver.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    }
  };

  const handleStatusChange = async (
    bookingId: string,
    bookingStatus: AdminBooking["status"],
    declineReason?: string
  ) => {
    const backendStatus = bookingStatus === "Approved" ? "approved" : bookingStatus === "Declined" ? "declined" : "pending";
    try {
      const res = await fetch(`${API_BASE}/api/bookings/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          bookingStatus,
          status: backendStatus,
          declineReason,
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast.success(`Booking ${bookingId} updated to ${bookingStatus}`);
        fetchBookings();
      } else {
        toast.error(res.message || "Failed to update booking status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    }
  };

  const handleConfirmDecline = () => {
    if (!declineModalBooking) return;
    handleStatusChange(declineModalBooking.id, "Declined", declineReasonText || "Driver unavailable for selected time.");
    setDeclineModalBooking(null);
    setDeclineReasonText("");
  };

  const filteredBookings = bookings.filter((b) =>
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + b.rawPrice, 0);

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8 animate-rise">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Single Administrator Control Center · Logged in as {user.name}</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Management Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Oversee all MongoDB customer bookings, driver assignments, customer accounts, and platform metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchBookings();
              fetchDrivers();
              toast.info("Refreshed Admin data from MongoDB.");
            }}
            className="rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold shadow-soft hover:bg-muted"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Bookings", val: String(bookings.length), icon: Calendar, color: "text-blue-500" },
          { label: "Active Drivers", val: String(drivers.length), icon: UserCheck, color: "text-emerald-500" },
          { label: "Customers", val: String(customers.length), icon: Users, color: "text-amber-500" },
          { label: "Total Revenue", val: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-primary" },
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

      {loading ? (
        <div className="rounded-3xl border border-border bg-background p-12 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading admin data from MongoDB database...</p>
        </div>
      ) : (
        <>
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

              {filteredBookings.length === 0 ? (
                <div className="rounded-3xl border border-border bg-background p-12 text-center text-xs text-muted-foreground">
                  No bookings found in MongoDB.
                </div>
              ) : (
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
                          <th className="p-4">Approval Status</th>
                          <th className="p-4 text-right">Actions (Approve / Decline)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-muted/40 transition">
                            <td className="p-4 font-mono font-bold text-primary">{b.id}</td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">{b.customer}</div>
                              <div className="text-[10px] text-muted-foreground">{b.customerEmail}</div>
                            </td>
                            <td className="p-4 font-semibold">{b.serviceType}</td>
                            <td className="p-4 text-muted-foreground">{b.duration}</td>
                            <td className="p-4">
                              <span className={`font-semibold ${b.driver === "Unassigned" ? "text-amber-600" : "text-foreground"}`}>
                                {b.driver}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-foreground">{b.price}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                b.status === "Approved" || b.status === "Assigned" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" :
                                b.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/30" :
                                b.status === "Completed" ? "bg-blue-500/10 text-blue-600 border border-blue-500/30" :
                                "bg-destructive/10 text-destructive border border-destructive/30"
                              }`}>
                                {b.status === "Pending" ? "🟡 Pending Approval" : b.status === "Approved" ? "🟢 Approved" : b.status === "Declined" ? "🔴 Declined" : b.status}
                              </span>
                              {b.declineReason && (
                                <p className="text-[10px] text-destructive/80 italic mt-0.5 truncate max-w-[140px]" title={b.declineReason}>
                                  "{b.declineReason}"
                                </p>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, "Approved")}
                                  disabled={b.status === "Approved" || b.status === "Assigned"}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                                    b.status === "Approved" || b.status === "Assigned"
                                      ? "bg-emerald-500/20 text-emerald-700 opacity-60 cursor-not-allowed"
                                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft"
                                  }`}
                                >
                                  ✅ Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeclineModalBooking(b);
                                    setDeclineReasonText(b.declineReason || "");
                                  }}
                                  disabled={b.status === "Declined"}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                                    b.status === "Declined"
                                      ? "bg-destructive/20 text-destructive opacity-60 cursor-not-allowed"
                                      : "bg-destructive text-white hover:bg-destructive/90 shadow-soft"
                                  }`}
                                >
                                  ❌ Decline
                                </button>

                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignDriver(b.id, e.target.value);
                                    }
                                  }}
                                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold outline-none focus:border-primary"
                                >
                                  <option value="" disabled>
                                    {b.driver === "Unassigned" ? "Assign Rider..." : "Reassign Rider..."}
                                  </option>
                                  {drivers.map((d) => (
                                    <option key={d._id || d.email} value={d.email}>
                                      {d.name} ({d.phone || d.email})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Decline Reason Modal */}
          {declineModalBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-lift space-y-5 animate-rise">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-destructive">Decline Booking ({declineModalBooking.id})</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Enter an optional reason for declining this booking.</p>
                  </div>
                  <button
                    onClick={() => setDeclineModalBooking(null)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Decline Reason (Optional)</label>
                    <textarea
                      rows={3}
                      value={declineReasonText}
                      onChange={(e) => setDeclineReasonText(e.target.value)}
                      placeholder="e.g. Driver unavailable for the selected time, or outside service coverage area."
                      className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3.5 text-sm outline-none focus:border-destructive placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Quick Presets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Driver unavailable for selected time",
                        "Location outside service coverage",
                        "Vehicle specifications not supported",
                        "High demand / Slot fully booked",
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDeclineReasonText(preset)}
                          className="rounded-xl border border-border bg-subtle px-2.5 py-1 text-[11px] hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeclineModalBooking(null)}
                      className="rounded-2xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDecline}
                      className="rounded-2xl bg-destructive px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-destructive/90"
                    >
                      Confirm Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Registered Chauffeur Drivers</h2>
                  <p className="text-xs text-muted-foreground">Manage riders with driver privileges in MongoDB database.</p>
                </div>
                <button
                  onClick={() => setShowAddDriverModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110"
                >
                  + Add New Driver (Rider Role)
                </button>
              </div>

              {drivers.length === 0 ? (
                <div className="rounded-3xl border border-border bg-background p-12 text-center text-xs text-muted-foreground space-y-3">
                  <UserCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p>No registered rider accounts found in MongoDB database.</p>
                  <button
                    onClick={() => setShowAddDriverModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-subtle px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Click here to add your first Driver
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {drivers.map((d, i) => (
                    <div key={i} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary font-bold text-base">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base truncate">{d.name}</h3>
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                              Rider
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                        </div>
                      </div>
                      <div className="border-t border-border pt-3 text-xs space-y-1.5 text-muted-foreground">
                        <div className="flex justify-between"><span>Phone</span><span className="font-semibold text-foreground">{d.phone || "—"}</span></div>
                        <div className="flex justify-between"><span>Status</span><span className="font-semibold text-emerald-600">Active (Rider)</span></div>
                        <div className="flex justify-between"><span>Registered</span><span className="font-bold text-foreground">{new Date(d.createdAt).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Driver Modal */}
          {showAddDriverModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-lift space-y-5 animate-rise">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Add New Driver</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Creates a rider account in MongoDB so the driver can log in.</p>
                  </div>
                  <button
                    onClick={() => setShowAddDriverModal(false)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddDriverSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Email Address (Login ID)</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh.driver@drivalong.com"
                      value={newDriverEmail}
                      onChange={(e) => setNewDriverEmail(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={newDriverPhone}
                      onChange={(e) => setNewDriverPhone(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Temporary Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newDriverPassword}
                      onChange={(e) => setNewDriverPassword(e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDriverModal(false)}
                      className="rounded-2xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDriver}
                      className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingDriver ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Create Driver Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="grid gap-4 md:grid-cols-3">
              {customers.length === 0 ? (
                <div className="col-span-3 rounded-3xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
                  No registered customer accounts found in MongoDB.
                </div>
              ) : (
                customers.map((c, i) => (
                  <div key={i} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-subtle text-foreground font-bold text-base">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base truncate">{c.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 text-xs space-y-1.5 text-muted-foreground">
                      <div className="flex justify-between"><span>Phone</span><span className="font-medium text-foreground">{c.phone || "—"}</span></div>
                      <div className="flex justify-between"><span>Registered</span><span className="font-medium text-foreground">{new Date(c.createdAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                ))
              )}
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
              <div className="text-4xl font-bold text-primary">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground">Calculated across {bookings.length} MongoDB chauffeur bookings.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

