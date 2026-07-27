import React from "react";
import { MapPin, Clock, RouteIcon, Car, ShieldCheck } from "lucide-react";
import { calculateFare, VEHICLE_RATES } from "./fareUtils";

interface BookingSummaryProps {
  pickup: string;
  drop: string;
  distanceKm: number;
  durationText: string;
  vehicleType?: string;
  className?: string;
}

export function BookingSummary({
  pickup,
  drop,
  distanceKm,
  durationText,
  vehicleType = "sedan",
  className = "",
}: BookingSummaryProps) {
  const fareInfo = calculateFare(distanceKm, vehicleType);

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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-subtle p-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
            <RouteIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Distance</p>
            <p className="font-semibold text-foreground">{distanceKm > 0 ? `${distanceKm} km` : "Calculating..."}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Est. Time (ETA)</p>
            <p className="font-semibold text-foreground">{durationText || "Calculating..."}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Fare Calculation Box */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5 capitalize">
            <Car className="h-4 w-4 text-primary" /> {fareInfo.ratePerKm} Rate ({vehicleType})
          </span>
          <span className="text-base font-bold text-primary">₹{fareInfo.totalFare}</span>
        </div>

        <div className="border-t border-primary/10 pt-2 text-[11px] text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Base Fare</span>
            <span>₹{fareInfo.baseFare}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance Cost ({distanceKm} km × ₹{fareInfo.ratePerKm}/km)</span>
            <span>₹{fareInfo.distanceCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
