import React from "react";
import { Clock, RouteIcon, Car, ShieldCheck, Timer, Loader2 } from "lucide-react";
import { formatCurrency, type FareBreakdown } from "./fareUtils";

interface BookingSummaryProps {
  pickup: string;
  drop: string;
  distanceKm: number;
  durationMinutes?: number;
  durationText: string;
  etaLabel?: string;
  fare: FareBreakdown | null;
  vehicleType?: string;
  loading?: boolean;
  ready?: boolean;
  className?: string;
}

export function BookingSummary({
  pickup,
  drop,
  distanceKm,
  durationText,
  etaLabel,
  fare,
  vehicleType = "sedan",
  loading = false,
  ready = true,
  className = "",
}: BookingSummaryProps) {
  const displayDist = distanceKm > 0 ? `${distanceKm} km` : fare ? `${fare.distanceKm} km` : null;
  const displayDuration = durationText || (fare ? `${fare.durationMinutes} min` : null);
  const displayEta = etaLabel || (fare ? new Date(Date.now() + fare.durationMinutes * 60_000).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null);

  return (
    <div className={`rounded-3xl border border-border bg-background p-5 shadow-soft space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <RouteIcon className="h-4 w-4" /> Ride Summary & Estimate
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <ShieldCheck className="h-3 w-3" /> Upfront Price
        </span>
      </div>

      {/* Locations */}
      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">Pickup</p>
            <p className="font-medium text-foreground truncate">{pickup || "Not selected"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-secondary" />
          <div className="flex-1">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">Drop-off</p>
            <p className="font-medium text-foreground truncate">{drop || "Not selected"}</p>
          </div>
        </div>
      </div>

      {!ready ? (
        <div className="rounded-2xl bg-subtle p-4 text-center text-xs text-muted-foreground">
          Select a pickup and drop-off from the suggestions above to see distance, time and fare.
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-subtle p-3.5 text-xs">
            <div className="flex flex-col items-start gap-1.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
                <RouteIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Distance</p>
                <p className="font-semibold text-foreground">
                  {displayDist || (loading ? "…" : "—")}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Travel Time</p>
                <p className="font-semibold text-foreground">{displayDuration || (loading ? "…" : "—")}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
                <Timer className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">Arrival (ETA)</p>
                <p className="font-semibold text-foreground">{displayEta || (loading ? "…" : "—")}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Fare Calculation Box */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5 capitalize">
                <Car className="h-4 w-4 text-primary" /> Chauffeur Ride Estimate
              </span>
              <span className="text-base font-bold text-primary flex items-center gap-1.5">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {fare ? formatCurrency(fare.totalFare) : "—"}
              </span>
            </div>

            <div className="border-t border-primary/10 pt-2 text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span>{fare ? formatCurrency(fare.baseFare) : "₹299"}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Distance Charge ({fare ? fare.distanceKm : distanceKm} km × {fare ? formatCurrency(fare.ratePerKm) : "₹13"}/km)
                </span>
                <span>{fare ? formatCurrency(fare.distanceCharge) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Time Charge ({fare ? (fare.durationMinutes / 60).toFixed(1) : "0"} hrs × {fare ? formatCurrency(fare.ratePerHour) : "₹120"}/hr)
                </span>
                <span>{fare ? formatCurrency(fare.timeCharge) : "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-primary/20 pt-2 text-sm font-bold text-foreground">
              <span>Total Fare</span>
              <span className="text-primary">{fare ? formatCurrency(fare.totalFare) : "—"}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
