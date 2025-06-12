import { Schema, model, models } from "mongoose";
import {
  IPostcodePreferenceMatrixD,
  IPostcodePreferenceMatrixM,
} from "@/types/mosaic";

const PostcodePreferenceMatrixSchema = new Schema<
  IPostcodePreferenceMatrixD,
  IPostcodePreferenceMatrixM
>(
  /*
   * test> db.Preferences.find().pretty()
[
  {
    _id: ObjectId('67ed3797a89f9520ef6b140c'),
    groupType: '22',
    preferences: {
      listing_preferences: {
        item: { weight: 0.33, types: null },
        service: { weight: 0.33, types: null },
        share: { weight: 0.33, types: null }
      }
    }
  },
  {
    _id: ObjectId('67ed3824a89f9520ef6b140d'),
    groupType: '23',
    preferences: {
      listing_preferences: {
        item: { weight: 0.33, types: null },
        service: { weight: 0.33, types: null },
        share: { weight: 0.33, types: null }
      }
    }
  },
  {
    _id: ObjectId('67ed3847a89f9520ef6b140e'),
    groupType: '24',
    preferences: {
      listing_preferences: {
        item: { weight: 0.33, types: null },
        service: { weight: 0.33, types: null },
        share: { weight: 0.33, types: null }
      }
    }
  },
  {
    _id: ObjectId('67ed385ea89f9520ef6b140f'),
    groupType: '25',
    preferences: {
      listing_preferences: {
        item: { weight: 0.33, types: null },
        service: { weight: 0.33, types: null },
        share: { weight: 0.33, types: null }
      }
    }
  }
]
      */
  {
    groupType: { type: String, required: true },
    timestamp: { type: Number, required: false },
    expiry_date: { type: Date, required: false },
    preferences: {
      listing_preferences: {
        item: { type: Object, required: true },
        service: { type: Object, required: true },
        share: { type: Object, required: true },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Preferences",
  },
);

export const Preference =
  models.Preference<IPostcodePreferenceMatrixD> ||
  model("Preference", PostcodePreferenceMatrixSchema);
