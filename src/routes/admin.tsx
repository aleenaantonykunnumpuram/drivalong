import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, UserCheck, Calendar, DollarSign, Award, CheckCircle2, Search, Filter, ShieldCheck,
  ArrowRight, Settings, Lock, Loader2, Star, ThumbsUp, Trash2, Check, X
} from "lucide-react";
import { toast } from "sonner";
import { CHAUFFEUR_SERVICES } from "@/lib/pricing";
import { useAuthUser } from "@/lib/auth";
import { getAllBookingsFn } from "@/lib/api/trip.functions";
import { getAllAdminReviews, updateReviewAdminFn } from "@/lib/api/review.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Management Panel — Driv A Long Private Limited" }],
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

interface ReviewItem {
  reviewId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  city: string;
  rating: number;
  title?: string;
  comment: string;
  rideType: string;
  recommend: boolean;
  status: "Pending" | "Approved" | "Rejected";
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const API_BASE = "http://127.0.0.1:5000";

function AdminPanel() {
  const { user } = useAuthUser();
  const [activeTab, setActiveTab] = useState<"bookings" | "drivers" | "customers" | "reviews" | "services" | "revenue">("bookings");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Review Filter State
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 0>(0);
  const [reviewFilterStatus, setReviewFilterStatus] = useState<string>("All");

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

  const fetchReviews = () => {
    getAllAdminReviews()
      .then((res) => {
        if (res.success && res.reviews) {
          setReviews(res.reviews as any);
        }
      })
      .catch((err) => console.error("Failed to load admin reviews:", err));
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

    fetch(`${API_BASE}/api/customers`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.customers) {
          setCustomers(res.customers);
        }
      })
      .catch((err) => console.error("Failed to load customers:", err));

    fetchDrivers();
    fetchReviews();
    setLoading(false);
  }, [user]);

  const handleReviewAction = async (reviewId: string, action: "approve" | "reject" | "toggleFeatured" | "delete") => {
    try {
      const res = await updateReviewAdminFn({ data: { reviewId, action } });
      if (res.success) {
        toast.success(res.message);
        fetchReviews();
      } else {
        toast.error(res.error || "Failed to update review.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating review.");
    }
  };

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
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-destructive/10 text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal Access Restricted</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            You must be logged in as an authorized Driv A Long administrator to access booking management, driver assignments, customer accounts, and reviews.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login" search={{ redirect: "/admin" }} className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
            Sign In as Admin
          </Link>
          <Link to="/" className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const handleAssignDriver = async (bookingId: string, driverEmail: string) => {
    const selectedDriver = drivers.find((d) => d.email === driverEmail);
    if (!selectedDriver) return;

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

  const filteredReviews = reviews.filter((r) => {
    const matchRating = reviewFilterRating === 0 || r.rating === reviewFilterRating;
    const matchStatus = reviewFilterStatus === "All" || r.status === reviewFilterStatus;
    const matchSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRating && matchStatus && matchSearch;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.rawPrice, 0);

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8 animate-rise">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Single Administrator Control Center · Logged in as {user.name}</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Admin Management Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Oversee all MongoDB customer bookings, driver assignments, customer reviews, and platform metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchBookings();
              fetchDrivers();
              fetchReviews();
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
          { label: "Customer Reviews", val: String(reviews.length), icon: Star, color: "text-[#F4B400]" },
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
        {(["bookings", "drivers", "customers", "reviews", "services", "revenue"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-2xl px-4 py-2.5 capitalize transition ${
              activeTab === t ? "bg-primary text-primary-foreground shadow-soft" : "bg-subtle text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "reviews" ? `Reviews (${reviews.length})` : t}
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
                  No bookings match search query.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-border bg-background p-5 shadow-soft space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{b.id}</span>
                          <span className="text-xs font-bold text-foreground">{b.serviceType}</span>
                          <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] font-semibold">{b.duration}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer: <strong className="text-foreground">{b.customer}</strong> ({b.customerEmail})</p>
                        <p className="text-xs text-muted-foreground">Pickup: <span className="font-medium text-foreground">{b.pickup}</span></p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-sm text-foreground">{b.price}</span>
                        <div className="flex items-center gap-2">
                          {b.status === "Pending" && (
                            <>
                              <button onClick={() => handleStatusChange(b.id, "Approved")} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600">
                                Approve
                              </button>
                              <button onClick={() => setDeclineModalBooking(b)} className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20">
                                Decline
                              </button>
                            </>
                          )}

                          <select
                            value={drivers.some((d) => d.name === b.driver) ? drivers.find((d) => d.name === b.driver)?.email : ""}
                            onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold outline-none"
                          >
                            <option value="">Assign Chauffeur ({b.driver})</option>
                            {drivers.map((d) => (
                              <option key={d.email} value={d.email}>{d.name} ({d.phone})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm min-w-[240px]">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search reviews by customer name or text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={reviewFilterStatus}
                    onChange={(e) => setReviewFilterStatus(e.target.value)}
                    className="rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-semibold outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    value={reviewFilterRating}
                    onChange={(e) => setReviewFilterRating(Number(e.target.value))}
                    className="rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-semibold outline-none"
                  >
                    <option value={0}>All Ratings (1-5 ⭐)</option>
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                    <option value={2}>2 Stars ⭐⭐</option>
                    <option value={1}>1 Star ⭐</option>
                  </select>
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="rounded-3xl border border-border bg-background p-12 text-center text-xs text-muted-foreground">
                  No verified customer reviews match your filter.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReviews.map((r) => (
                    <div key={r.reviewId} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#F4B400]">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`h-4 w-4 ${idx < r.rating ? "fill-[#F4B400]" : "text-slate-300"}`} />
                            ))}
                            <span className="ml-1.5 text-xs font-bold text-foreground">{r.rating}.0</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            r.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" :
                            r.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/30" :
                            "bg-destructive/10 text-destructive border border-destructive/30"
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        {r.title && <h4 className="font-bold text-sm text-foreground">{r.title}</h4>}
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{r.comment}"</p>

                        <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0B2D7A] text-white font-bold text-xs">
                              {r.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{r.customerName}</p>
                              <p className="text-[10px] text-muted-foreground">{r.city} · {r.rideType}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            <ShieldCheck className="h-3 w-3" /> Verified Ride
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {r.status !== "Approved" && (
                            <button
                              onClick={() => handleReviewAction(r.reviewId, "approve")}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                          )}
                          {r.status !== "Rejected" && (
                            <button
                              onClick={() => handleReviewAction(r.reviewId, "reject")}
                              className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReviewAction(r.reviewId, "toggleFeatured")}
                            className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border transition ${r.isFeatured ? "bg-[#F4B400]/20 border-[#F4B400] text-[#D99B00]" : "border-border text-muted-foreground hover:bg-muted"}`}
                            title="Toggle Homepage Featured"
                          >
                            ⭐ {r.isFeatured ? "Featured" : "Feature"}
                          </button>
                          <button
                            onClick={() => handleReviewAction(r.reviewId, "delete")}
                            className="rounded-xl border border-destructive/30 p-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddDriverModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:brightness-110"
                >
                  + Register New Chauffeur
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {drivers.map((d, i) => (
                  <div key={i} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-base">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base truncate">{d.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{d.email}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 text-xs space-y-1.5 text-muted-foreground">
                      <div className="flex justify-between"><span>Phone</span><span className="font-medium text-foreground">{d.phone || "—"}</span></div>
                      <div className="flex justify-between"><span>Role</span><span className="font-bold text-emerald-600 uppercase text-[10px]">Verified Chauffeur</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="grid gap-4 md:grid-cols-3">
              {customers.map((c, i) => (
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
              <div className="text-4xl font-bold text-primary">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground">Calculated across {bookings.length} MongoDB chauffeur bookings.</p>
            </div>
          )}
        </>
      )}

      {/* Decline Booking Reason Modal */}
      {declineModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4 animate-rise">
            <h3 className="text-lg font-bold text-foreground">Decline Booking {declineModalBooking.id}</h3>
            <p className="text-xs text-muted-foreground">
              Please state why this booking is being declined. The reason will be visible to the customer on their dashboard.
            </p>

            <textarea
              value={declineReasonText}
              onChange={(e) => setDeclineReasonText(e.target.value)}
              placeholder="e.g. No verified driver available for requested pickup time slot..."
              rows={3}
              className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium outline-none focus:border-primary"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeclineModalBooking(null)}
                className="rounded-2xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="rounded-2xl bg-destructive px-6 py-2.5 text-xs font-bold text-destructive-foreground shadow-soft hover:brightness-110"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-4 animate-rise">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Register New Driver Account</h3>
              <button onClick={() => setShowAddDriverModal(false)} className="rounded-xl p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDriverSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  placeholder="driver@drivalong.com"
                  value={newDriverEmail}
                  onChange={(e) => setNewDriverEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
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
    </div>
  );
}
