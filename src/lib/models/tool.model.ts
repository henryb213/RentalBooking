import { Schema, model, models } from "mongoose";

const ToolSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    condition: {
      type: String,
      enum: ["new", "excellent", "good", "fair", "poor"],
      required: true,
    },
    availability: {
      type: String,
      enum: ["available", "borrowed", "maintenance"],
      default: "available",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentBorrower: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      borrowDate: Date,
      expectedReturnDate: Date,
    },
    borrowHistory: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        borrowDate: Date,
        returnDate: Date,
        condition: String,
      },
    ],
    maintenanceLog: [
      {
        date: { type: Date, default: Date.now },
        description: String,
        performedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Tools",
  },
);

export const Tool = models.Tool || model("Tool", ToolSchema);
