import { Schema, model, models } from "mongoose";
import type { INotificationD, INotificationM } from "@/types/notification";

const NotificationSchema = new Schema<INotificationD, INotificationM>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "system",
        "task",
        "marketplace",
        "points",
        "badges",
        "membership",
        "misc",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    link: { type: String }, // Optional link to related content
    expiresAt: { type: Date }, // Optional expiration date
    readAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Notifications",
  },
);

export const Notification =
  models.Notification || model("Notification", NotificationSchema);
