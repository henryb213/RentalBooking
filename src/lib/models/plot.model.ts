import { IPlotD, IPlotM } from "@/types/plotManagement/plots";
import { Schema, model, models } from "mongoose";

const PlotSchema = new Schema<IPlotD, IPlotM>(
  {
    name: { type: String, required: true },
    description: String,
    size: {
      type: Number,
      set: (v: string) => Number(v),
    },
    location: String,
    status: {
      type: String,
      enum: ["available", "full", "maintenance"],
      default: "available",
    },
    condition: {
      type: String,
      enum: ["Full Sun", "Partial Sun", "No sun"],
    },
    soilPh: {
      type: String,
      enum: ["Neutral: 6.5 - 7.5", "Acidic: < 6.5", "Alkaline: > 7.5"],
    },
    soilType: {
      type: String,
      enum: ["Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"],
    },
    gardenSetting: {
      type: String,
      enum: ["Back garden", "Front garden", "Other"],
    },
    groupType: {
      type: String,
      enum: ["Communal", "Private"],
    },
    requiredTasks: [
      {
        tType: {
          type: String,
          enum: [
            "Watering",
            "Weeding",
            "Harvesting",
            "Planting",
            "Pruning",
            "Mowing",
            "Other",
          ],
        },
        frequency: {
          type: String,
          enum: ["Daily", "Weekly", "Monthly"],
        },
        duration: {
          type: String,
          enum: [
            "15-30 minutes",
            "30-60 minutes",
            "1-2 hours",
            "2-4 hours",
            "4+ hours",
          ],
        },
      },
    ],
    plants: [
      {
        type: String,
        enum: [
          "Perennial",
          "Shrubs",
          "Climbers",
          "Bulbs",
          "Mature-shrubs",
          "Grasses",
          "Flowers",
          "Ferns",
          "Fruit",
          "Herbs",
          "Vegetables",
          "Hedging",
          "Trees",
          "Indoor-plants",
          "Soil",
          "Seeds",
        ],
        required: true,
      },
    ],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    memberLimit: Number,
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        joinedDate: Date,
      },
    ],
    requests: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        sentAt: { type: Date, default: Date.now },
        message: { type: String, default: "" },
      },
    ],
    history: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "assigned",
            "unassigned",
            "maintenance",
            "requested",
          ],
        },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    images: [
      {
        url: String,
        isMain: Boolean,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Plots",
  },
);

export const Plot = models.Plot || model("Plot", PlotSchema);
