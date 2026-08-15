import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  reviewId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  city?: string;
  driverName?: string;
  rating: number;
  title?: string;
  comment: string;
  rideType: string;
  recommend: boolean;
  driverBehavior?: {
    professionalism?: number;
    punctuality?: number;
    drivingQuality?: number;
    cleanliness?: number;
    communication?: number;
  };
  status: "Pending" | "Approved" | "Rejected";
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewId: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerAvatar: { type: String, default: "" },
    city: { type: String, default: "Kochi" },
    driverName: { type: String, default: "Assigned Chauffeur" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true, maxlength: 500 },
    rideType: { type: String, default: "Round-Trip Chauffeur" },
    recommend: { type: Boolean, default: true },
    driverBehavior: {
      professionalism: { type: Number, default: 5 },
      punctuality: { type: Number, default: 5 },
      drivingQuality: { type: Number, default: 5 },
      cleanliness: { type: Number, default: 5 },
      communication: { type: Number, default: 5 },
    },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
