import { Schema, model, models } from "mongoose";
import { IListingD, IListingM } from "@/types/marketplace/listing.interface";

const ListingSchema = new Schema<IListingD, IListingM>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number },
    type: { type: String, enum: ["item", "service", "share"], required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "closed"],
      required: true,
    },
    imageUrls: { type: [String] },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    purchasedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    taskboardId: { type: Schema.Types.ObjectId },
    postcode: { type: String, required: true },
    location: {
      type: [Number],
      index: "2d",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Listings",
  },
);

export const Listing =
  models.Listing<IListingD> || model("Listing", ListingSchema);
