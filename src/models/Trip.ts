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
  customerId?: mongoose.Types.ObjectId;
  pickup: ILocationPoint;
  drop: ILocationPoint;
  vehicleType: string;
  distanceKm: number;
  durationMinutes: number;
  durationInTrafficMinutes?: number;
  etaTime: Date;
  routePolyline: string;
  fare: IFareBreakdown;
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
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    pickup: { type: LocationPointSchema, required: true },
    drop: { type: LocationPointSchema, required: true },
    vehicleType: { type: String, required: true, default: "sedan" },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    durationInTrafficMinutes: { type: Number },
    etaTime: { type: Date, required: true },
    routePolyline: { type: String, default: "" },
    fare: { type: FareBreakdownSchema, required: true },
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
