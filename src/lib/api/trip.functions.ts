import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { calculateFare, computeEtaDate, type VehicleType } from "../pricing";
import { fetchDrivingDirections, DirectionsApiError } from "../googleDirections.server";
import { connectToDatabase } from "../mongodb";
import Trip from "../../models/Trip";

const coordsSchema = z.object({ lat: z.number(), lng: z.number() });

const vehicleTypeSchema = z.enum(["hatchback", "sedan", "suv", "luxury", "ev"]).default("sedan");

/**
 * POST /api trip estimate — accepts pickup & drop coordinates, calls the
 * Google Directions API (server-side, with live traffic), and returns
 * distance, duration, ETA, route polyline, and a full fare breakdown.
 *
 * This is the "backend API" required by the trip estimation feature:
 *   input:  { pickup: {lat,lng,address}, drop: {lat,lng,address}, vehicleType }
 *   output: { distanceKm, durationMinutes, durationInTrafficMinutes,
 *              etaTime, etaLabel, routePolyline, fare }
 */
export const getTripEstimate = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      pickup: coordsSchema.extend({ address: z.string().optional() }),
      drop: coordsSchema.extend({ address: z.string().optional() }),
      vehicleType: vehicleTypeSchema,
    })
  )
  .handler(async ({ data }) => {
    try {
      const directions = await fetchDrivingDirections(
        { lat: data.pickup.lat, lng: data.pickup.lng },
        { lat: data.drop.lat, lng: data.drop.lng }
      );

      // Prefer the live-traffic-aware duration for both the ETA and the
      // fare's time charge whenever Google returns one.
      const effectiveDurationMinutes = directions.durationInTrafficMinutes ?? directions.durationMinutes;

      const fare = calculateFare(directions.distanceKm, effectiveDurationMinutes, data.vehicleType as VehicleType);
      const etaTime = computeEtaDate(effectiveDurationMinutes);

      return {
        success: true as const,
        distanceKm: directions.distanceKm,
        durationMinutes: directions.durationMinutes,
        durationInTrafficMinutes: directions.durationInTrafficMinutes,
        effectiveDurationMinutes,
        etaTime: etaTime.toISOString(),
        startAddress: directions.startAddress,
        endAddress: directions.endAddress,
        routePolyline: directions.overviewPolyline,
        fare,
      };
    } catch (err) {
      const message = err instanceof DirectionsApiError ? err.message : "Failed to calculate the driving route.";
      const status = err instanceof DirectionsApiError ? err.status : "UNKNOWN_ERROR";
      return { success: false as const, error: message, status };
    }
  });

/**
 * POST /api create booking — persists a confirmed trip estimate as a
 * booking document in MongoDB and returns a generated booking ID.
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      customerId: z.string().optional(),
      pickup: coordsSchema.extend({ address: z.string() }),
      drop: coordsSchema.extend({ address: z.string() }),
      vehicleType: vehicleTypeSchema,
      distanceKm: z.number(),
      durationMinutes: z.number(),
      durationInTrafficMinutes: z.number().optional(),
      etaTime: z.string(),
      routePolyline: z.string().optional().default(""),
      fare: z.object({
        baseFare: z.number(),
        ratePerKm: z.number(),
        ratePerHour: z.number(),
        distanceCharge: z.number(),
        timeCharge: z.number(),
        totalFare: z.number(),
      }),
    })
  )
  .handler(async ({ data }) => {
    await connectToDatabase();

    const bookingId = "DAL" + Math.floor(100000 + Math.random() * 900000);

    const trip = await Trip.create({
      bookingId,
      pickup: data.pickup,
      drop: data.drop,
      vehicleType: data.vehicleType,
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      durationInTrafficMinutes: data.durationInTrafficMinutes,
      etaTime: new Date(data.etaTime),
      routePolyline: data.routePolyline,
      fare: data.fare,
      status: "confirmed",
    });

    return { success: true as const, bookingId: trip.bookingId };
  });
