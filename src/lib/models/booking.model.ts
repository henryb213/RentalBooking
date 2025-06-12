import { IBookingD, IBookingM } from "@/types/booking";
import { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      required: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Bookings",
  }
);

const Booking =
  models.Booking<IBookingD> || model<IBookingD>("Booking", BookingSchema);
export { Booking };