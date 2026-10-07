import React from "react";
import { UserCheck, ShieldCheck, Sparkles } from "lucide-react";
import { formatCurrency, CHAUFFEUR_SERVICES, type ServiceType } from "./fareUtils";

interface BookingSummaryProps {
  pickup: string;
  drop?: string;
  serviceType?: string;
  className?: string;
  // Optional props preserved for backward compatibility
  distanceKm?: number;
  durationMinutes?: number;
  durationText?: string;
  etaLabel?: string;
  fare?: any;
  loading?: boolean;
  ready?: boolean;
}

export function BookingSummary({
  pickup,
  drop = "",
  serviceType = "Round-Trip Chauffeur",
  className = "",
}: BookingSummaryProps) {
  const serviceDetails =
    CHAUFFEUR_SERVICES[serviceType as ServiceType] ||
    CHAUFFEUR_SERVICES["Round-Trip Chauffeur"];

  const baseFare = serviceDetails?.baseFare ?? 299;

  return (
    <div className={`rounded-3xl border border-border bg-background p-5 shadow-soft space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <UserCheck className="h-4 w-4" /> Service Details
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <ShieldCheck className="h-3 w-3" /> Base Fee
        </span>
      </div>

      {/* Locations */}
      <div className="space-y-3 text-xs">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">Pickup Location</p>
            <p className="font-medium text-foreground truncate">{pickup || "Enter your pickup location above"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">Destination</p>
            <p className="font-medium text-foreground truncate">{drop || "Flexible Route (Optional)"}</p>
          </div>
        </div>
      </div>

      {/* Base Service Fee Only */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5 capitalize text-sm">
            <Sparkles className="h-4 w-4 text-primary" /> {serviceDetails?.title || serviceType}
          </span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(baseFare)}
          </span>
        </div>

        <div className="border-t border-primary/10 pt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Base Service Fee</span>
          <span className="font-bold text-foreground text-sm">{formatCurrency(baseFare)}</span>
        </div>

        <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
          Standard chauffeur base fee for this service. Driver allocation and route tracking will be activated upon booking.
        </p>
      </div>
    </div>
  );
}
