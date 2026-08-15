import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar, Clock, MapPin, UserCheck, Download, Navigation, XCircle, RefreshCw,
  CheckCircle2, Star, Shield, ArrowRight, Lock, Loader2, ThumbsUp, X
} from "lucide-react";
import { toast } from "sonner";
import { useAuthUser } from "@/lib/auth";
import { getUserBookingsFn } from "@/lib/api/trip.functions";
import { submitReview } from "@/lib/api/review.functions";
import { downloadRideSummaryReceipt } from "@/lib/pdfUtils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Customer Dashboard — Driv A Long Private Limited" }],
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
  status: "Pending" | "Approved" | "Declined" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  declineReason?: string;
  updatedAt?: string;
  reviewed?: boolean;
  userRating?: number;
}

function CustomerDashboard() {
  const { user } = useAuthUser();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [recommend, setRecommend] = useState<boolean>(true);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserBookings = (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      getUserBookingsFn({ data: { email: user.email } })
        .then((res) => {
          if (res.success && res.trips) {
            const mapped: BookingItem[] = res.trips.map((t: any) => {
              let st = t.bookingStatus || "Pending";
              if (t.status === "declined" || st === "Declined") st = "Declined";
              else if (t.status === "completed" || st === "Completed") st = "Completed";
              else if (t.status === "approved" && st === "Pending") st = "Approved";

              return {
                id: t.bookingId,
                serviceType: t.serviceType || "Round-Trip Chauffeur",
                pickup: t.pickup?.address || "Pickup Location",
                destination: t.drop?.address || "Flexible / Hourly Route",
                date: t.bookingDate || new Date(t.createdAt).toLocaleDateString(),
                time: t.bookingTime || "Scheduled",
                duration: t.duration || "4 Hours",
                price: t.estimatedPrice || t.fare?.totalFare ? `₹${t.estimatedPrice || t.fare?.totalFare}` : "Fare Upon Pickup",
                driverName: t.driverName || "Unassigned",
                driverPhone: t.driverPhone || "",
                status: st as any,
                declineReason: t.declineReason || "",
                updatedAt: t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "",
                reviewed: t.reviewed || false,
                userRating: t.userRating || 5,
              };
            });
            setBookings(mapped);
          }
        })
        .catch((err) => console.error("Failed to load user bookings:", err))
        .finally(() => setLoading(false));
    };

    fetchUserBookings(true);
    const interval = setInterval(() => fetchUserBookings(false), 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)));
    toast.success(`Booking ${id} cancelled successfully.`);
  };

  const handleReschedule = (id: string) => {
    toast.info(`Reschedule request initiated for ${id}. Select new time.`);
  };

  const handleDownloadInvoice = (b: BookingItem) => {
    downloadRideSummaryReceipt({
      bookingId: b.id,
      serviceType: b.serviceType,
      pickup: b.pickup,
      destination: b.destination,
      bookingDate: b.date,
      bookingTime: b.time,
      duration: b.duration,
      estimatedFare: b.price,
      driverName: b.driverName,
      driverPhone: b.driverPhone,
      status: b.status,
      customerName: user?.name,
      customerEmail: user?.email,
    });
    toast.success(`Ride Summary Receipt generated for ${b.id}`);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview || !user) return;
    if (reviewComment.trim().length < 3) {
      toast.error("Please enter your review experience (minimum 3 characters).");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await submitReview({
        data: {
          bookingId: selectedBookingForReview.id,
          customerId: user.email,
          customerName: user.name || "Verified Customer",
          city: "Kochi",
          rating,
          title: reviewTitle,
          comment: reviewComment,
          rideType: selectedBookingForReview.serviceType,
          recommend,
        },
      });

      if (res.success) {
        toast.success("Thank you! Your review has been submitted successfully.");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBookingForReview.id
              ? { ...b, reviewed: true, userRating: rating }
              : b
          )
        );
        setSelectedBookingForReview(null);
        setReviewTitle("");
        setReviewComment("");
      } else {
        toast.error(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="container-px mx-auto max-w-4xl py-16 text-center space-y-6">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-primary">
          <Lock className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Dashboard Access</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Please log in to your Driv A Long customer account to view your past ride history, track active chauffeurs, and manage bookings.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link to="/login" search={{ redirect: "/dashboard" }} className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-110">
            Sign In to Dashboard
          </Link>
          <Link to="/signup" search={{ redirect: "/dashboard" }} className="rounded-2xl border border-border bg-background px-6 py-3 text-sm font-semibold hover:bg-muted">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const upcomingList = bookings.filter((b) => b.status === "Pending" || b.status === "Approved" || b.status === "Assigned" || b.status === "In Progress");
  const historyList = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled" || b.status === "Declined");
  const activeList = tab === "upcoming" ? upcomingList : historyList;

  return (
    <div className="container-px mx-auto max-w-7xl py-10 md:py-16 space-y-8 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Logged in as {user.name} ({user.email})</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Customer Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your chauffeur bookings, track approval status, and submit ride reviews.</p>
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
          Active & Upcoming ({upcomingList.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`rounded-xl px-5 py-2.5 transition ${tab === "history" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"}`}
        >
          Booking History ({historyList.length})
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-background p-12 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading your rides from MongoDB...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background p-12 text-center space-y-3">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No {tab} bookings found</h3>
          <p className="text-xs text-muted-foreground">You have no {tab} chauffeur bookings recorded under {user.email}.</p>
          <div className="pt-2">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft">
              Book a Chauffeur Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeList.map((b) => (
            <div key={b.id} className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{b.id}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    b.status === "Approved" || b.status === "Assigned" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" :
                    b.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/30 animate-pulse" :
                    b.status === "Completed" ? "bg-blue-500/10 text-blue-600 border border-blue-500/30" :
                    "bg-destructive/10 text-destructive border border-destructive/30"
                  }`}>
                    {b.status === "Pending" ? "🟡 Pending Approval" : b.status === "Approved" ? "🟢 Approved" : b.status === "Declined" ? "🔴 Declined" : b.status}
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

                {/* Status Explanation Card */}
                {b.status === "Completed" && (
                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-3.5 text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
                    <div className="font-bold flex items-center justify-between text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 shrink-0" /> Ride Completed</span>
                      <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full font-semibold">Verified Ride</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-200">
                      Your journey with Driv A Long was completed successfully on {b.date}.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2">
                {b.status === "Completed" ? (
                  b.reviewed ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-2.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" /> Review Submitted ({b.userRating || 5} ⭐)
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedBookingForReview(b);
                        setRating(5);
                        setReviewTitle("");
                        setReviewComment("");
                        setRecommend(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F4B400] hover:bg-[#E5A800] py-2.5 text-xs font-extrabold text-slate-950 shadow-lift transition-all cursor-pointer"
                    >
                      <Star className="h-4 w-4 fill-slate-950 text-slate-950" /> Leave a Review
                    </button>
                  )
                ) : b.status === "Assigned" ? (
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
                    onClick={() => handleDownloadInvoice(b)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-subtle py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Summary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-2xl space-y-5 animate-rise">
            <button
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">VERIFIED RIDE FEEDBACK</span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">Review Your Chauffeur Experience</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Booking ID: <span className="font-mono font-semibold text-foreground">{selectedBookingForReview.id}</span> ({selectedBookingForReview.serviceType})
              </p>
            </div>

            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${active ? "fill-[#F4B400] text-[#F4B400]" : "text-slate-300 dark:text-slate-600"}`} />
                    </button>
                  );
                })}
                <span className="ml-2 text-sm font-bold text-foreground">{rating}.0 / 5.0</span>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Review Title (Optional)</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Excellent Punctual Chauffeur"
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-medium outline-none focus:border-primary"
              />
            </div>

            {/* Review Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Experience</label>
                <span className="text-[10px] text-muted-foreground">{reviewComment.length}/500</span>
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Tell us about your experience with our verified chauffeur..."
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs font-medium outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Would you recommend Driv A Long?</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition ${recommend ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}
                >
                  <ThumbsUp className="h-4 w-4" /> Yes, Highly Recommend
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition ${!recommend ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-background text-muted-foreground"}`}
                >
                  Needs Improvement
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForReview(null)}
                className="rounded-2xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1E5AE8] hover:bg-[#1546bd] text-white px-6 py-2.5 text-xs font-bold shadow-lift hover:brightness-110 disabled:opacity-50"
              >
                {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
