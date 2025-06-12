import { Schema, model, models } from "mongoose";
import type { IUserD, IUserM } from "@/types/user";

const UserSchema = new Schema<IUserD, IUserM>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    points: { type: Number, default: 100 },
    notificationCount: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["admin", "plotOwner", "communityMember"],
      required: true,
    },
    profile: {
      bio: String,
      avatar: String,
      skills: [String],
      interests: [String],
    },
    address: {
      street: String,
      city: String,
      region: String,
      postCode: String,
    },
    favouritePlots: [String],
    firstGardenJoined: { type: Boolean, default: false },
    firstGardenLent: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Users",
  },
);

export const User = models.User<IUserD> || model("User", UserSchema);
