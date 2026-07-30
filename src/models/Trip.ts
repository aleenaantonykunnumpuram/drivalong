import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocationPoint {
  address: string;
  lat: number;
  lng: number;
}

export interface IFareBreakdown {
  baseFare: number;
  ratePerKm: number;
  ratePerHour: number;
  distanceCharge: number;
  timeCharge: number;
  totalFare: number;
}

export interface ITrip extends Document {
  bookingId: string;
  customerId?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  serviceType: string;
  pickup: ILocationPoint;
  drop?: ILocationPoint | null;
  bookingDate?: string;
  bookingTime?: string;
  duration?: string;
  transmission?: string;
  specialInstructions?: string;
  estimatedPrice: number;
  distanceKm: number;
  durationMinutes: number;
  durationInTrafficMinutes?: number;
  etaTime?: Date;
  routePolyline?: string;
  fare?: IFareBreakdown;
  bookingStatus: "Pending" | "Assigned" | "Driver En Route" | "In Progress" | "Completed" | "Cancelled";
  paymentStatus: "Pending" | "Paid";
  paymentMethod?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const LocationPointSchema = new Schema<ILocationPoint>(
  {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const FareBreakdownSchema = new Schema<IFareBreakdown>(
  {
    baseFare: { type: Number, required: true },
    ratePerKm: { type: Number, required: true },
    ratePerHour: { type: Number, required: true },
    distanceCharge: { type: Number, required: true },
    timeCharge: { type: Number, required: true },
    totalFare: { type: Number, required: true },
  },
  { _id: false }
);

const TripSchema = new Schema<ITrip>(
  {
    bookingId: { type: String, required: true, unique: true },
    customerId: { type: String },
    driverId: { type: String },
    driverName: { type: String, default: "Rajesh Kumar (Pro Chauffeur)" },
    driverPhone: { type: String, default: "+91 98765 43210" },
    serviceType: { type: String, required: true, default: "Hourly Chauffeur" },
    pickup: { type: LocationPointSchema, required: true },
    drop: { type: LocationPointSchema, default: null },
    bookingDate: { type: String },
    bookingTime: { type: String },
    duration: { type: String, default: "4 Hours" },
    transmission: { type: String, default: "Automatic" },
    specialInstructions: { type: String, default: "" },
    estimatedPrice: { type: Number, required: true },
    distanceKm: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 60 },
    durationInTrafficMinutes: { type: Number },
    etaTime: { type: Date },
    routePolyline: { type: String, default: "" },
    fare: { type: FareBreakdownSchema },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Assigned", "Driver En Route", "In Progress", "Completed", "Cancelled"],
      default: "Assigned",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Paid",
    },
    paymentMethod: { type: String, default: "UPI" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export default Trip;
