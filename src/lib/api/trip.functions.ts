import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { calculateFare, computeEtaDate, DURATION_HOURS, type ServiceType, type DurationOption } from "../pricing";
import { fetchDrivingDirections, DirectionsApiError } from "../googleDirections.server";
import { connectToDatabase } from "../mongodb";
import Trip from "../../models/Trip";

const coordsSchema = z.object({ lat: z.number(), lng: z.number() });

const serviceTypeSchema = z.string().default("Hourly Chauffeur");

/**
 * POST /api trip estimate — accepts pickup & optional drop coordinates,
 * duration and serviceType, calls the Google Directions API if drop is provided,
 * and returns distance, duration, ETA, route polyline, and a full fare breakdown.
 */
export const getTripEstimate = createServerFn({ method: "POST" })
  .validator(
    z.object({
      pickup: coordsSchema.extend({ address: z.string().optional() }),
      drop: coordsSchema.extend({ address: z.string().optional() }).optional().nullable(),
      serviceType: serviceTypeSchema,
      duration: z.string().optional().default("4 Hours"),
    })
  )
  .handler(async ({ data }) => {
    try {
      let distanceKm = 0;
      let durationMinutes = (DURATION_HOURS[data.duration as DurationOption] || 4) * 60;
      let durationInTrafficMinutes: number | undefined = undefined;
      let routePolyline = "";
      let startAddress = data.pickup.address || "";
      let endAddress = data.drop?.address || "";

      if (data.drop && data.drop.lat && data.drop.lng) {
        const directions = await fetchDrivingDirections(
          { lat: data.pickup.lat, lng: data.pickup.lng },
          { lat: data.drop.lat, lng: data.drop.lng }
        );
        distanceKm = directions.distanceKm;
        durationMinutes = directions.durationInTrafficMinutes ?? directions.durationMinutes;
        durationInTrafficMinutes = directions.durationInTrafficMinutes ?? undefined;
        routePolyline = directions.overviewPolyline;
        startAddress = directions.startAddress || startAddress;
        endAddress = directions.endAddress || endAddress;
      }

      const fare = calculateFare(distanceKm, durationMinutes, data.serviceType as ServiceType);
      const etaTime = computeEtaDate(durationMinutes);

      return {
        success: true as const,
        distanceKm,
        durationMinutes,
        durationInTrafficMinutes,
        effectiveDurationMinutes: durationMinutes,
        etaTime: etaTime.toISOString(),
        startAddress,
        endAddress,
        routePolyline,
        fare,
      };
    } catch (err) {
      const message = err instanceof DirectionsApiError ? err.message : "Failed to calculate estimate.";
      const status = err instanceof DirectionsApiError ? err.status : "UNKNOWN_ERROR";
      return { success: false as const, error: message, status };
    }
  });

/**
 * POST /api create booking — persists a confirmed chauffeur booking in MongoDB.
 */
export const createBooking = createServerFn({ method: "POST" })
  .validator(
    z.object({
      customerId: z.string().optional(),
      customerEmail: z.string().optional(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      serviceType: z.string().default("Hourly Chauffeur"),
      pickup: coordsSchema.extend({ address: z.string() }),
      drop: coordsSchema.extend({ address: z.string() }).optional().nullable(),
      bookingDate: z.string().optional(),
      bookingTime: z.string().optional(),
      duration: z.string().optional().default("4 Hours"),
      transmission: z.string().optional().default("Automatic"),
      specialInstructions: z.string().optional().default(""),
      distanceKm: z.number().default(0),
      durationMinutes: z.number().default(60),
      durationInTrafficMinutes: z.number().optional(),
      etaTime: z.string().optional(),
      routePolyline: z.string().optional().default(""),
      paymentMethod: z.string().optional().default("UPI"),
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

    const bookingId = "DAL" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + String(Math.floor(1000 + Math.random() * 9000));

    const trip = await Trip.create({
      bookingId,
      customerId: data.customerId || "CUST_DEMO_01",
      customerEmail: data.customerEmail ? data.customerEmail.toLowerCase().trim() : "",
      customerName: data.customerName || "Customer",
      customerPhone: data.customerPhone || "",
      driverName: "Unassigned",
      driverPhone: "",
      serviceType: data.serviceType,
      pickup: data.pickup,
      drop: data.drop || null,
      bookingDate: data.bookingDate || new Date().toISOString().slice(0, 10),
      bookingTime: data.bookingTime || "Now",
      duration: data.duration,
      transmission: data.transmission,
      specialInstructions: data.specialInstructions,
      estimatedPrice: data.fare.totalFare,
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      durationInTrafficMinutes: data.durationInTrafficMinutes,
      etaTime: data.etaTime ? new Date(data.etaTime) : new Date(),
      routePolyline: data.routePolyline,
      fare: data.fare,
      bookingStatus: "Pending",
      paymentStatus: "Paid",
      paymentMethod: data.paymentMethod,
      status: "pending",
    });

    return { success: true as const, bookingId: trip.bookingId };
  });

/**
 * POST /api update booking status — approves or declines a booking with optional decline reason.
 */
export const updateBookingStatusFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      bookingId: z.string(),
      bookingStatus: z.enum(["Pending", "Approved", "Declined", "Assigned", "In Progress", "Completed", "Cancelled"]).optional(),
      status: z.enum(["pending", "approved", "declined", "confirmed", "completed", "cancelled"]).optional(),
      declineReason: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      const bookingStatus = data.bookingStatus || (data.status === "approved" ? "Approved" : data.status === "declined" ? "Declined" : "Pending");
      const status = data.status || (bookingStatus === "Approved" || bookingStatus === "Assigned" ? "approved" : bookingStatus === "Declined" ? "declined" : "pending");

      const updateData: any = { bookingStatus, status };
      if (data.declineReason !== undefined) {
        updateData.declineReason = data.declineReason;
      }

      const trip = await Trip.findOneAndUpdate({ bookingId: data.bookingId }, updateData, { new: true });
      if (!trip) {
        return { success: false, error: "Booking not found." };
      }

      return { success: true, trip: JSON.parse(JSON.stringify(trip)) };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update status." };
    }
  });

/**
 * GET /api user bookings — fetches all rides for a specific customer email
 */
export const getUserBookingsFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string() }))
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      const trips = await Trip.find({ customerEmail: data.email.toLowerCase().trim() }).sort({ createdAt: -1 });
      return { success: true, trips: JSON.parse(JSON.stringify(trips)) };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to fetch bookings." };
    }
  });

/**
 * GET /api all bookings — fetches all rides in MongoDB for Admin
 */
export const getAllBookingsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      await connectToDatabase();
      const trips = await Trip.find({}).sort({ createdAt: -1 });
      return { success: true, trips: JSON.parse(JSON.stringify(trips)) };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to fetch all bookings." };
    }
  });

