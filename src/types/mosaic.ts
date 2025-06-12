import type { Model, Types, Document } from "mongoose";

export type MosaicType = "22" | "23" | "24" | "25";

export interface IPostcodeType {
  postcode: string;
  group: "F";
  type: MosaicType;
  northings: number;
  eastings: number;
  /*
  22 : Boomerang Boarders
  23 : Family Ties
  24 : Fledgling Free
  25 : Dependable Me
  Accessed at https://www.experian.co.uk/business/platforms/mosaic/segmentation-groups#suburban-stability-groups
  */
}

/*
 * The data used to influence what is recommended to each postcode type.
 * - type: E.g. F23
 * TODO: Finish this documentation and flesh out matrices more.
 */
export interface IPostcodePreferenceMatrix {
  groupType: MosaicType;
  timestamp?: Date;
  expiry_date?: Date;
  preferences: {
    listing_preferences: {
      item: {
        weight: number;
        types?: {
          example: 1;
          // TODO:: Add item type weightings here. 13/03/2025
        };
      };
      service: {
        weight: number;
        types?: {
          example: 1;
          // TODO : Add service type weightings here. 13/03/2025
        };
      };
      share: {
        weight: number;
        types?: {
          example: 1;
          // TODO : Add share type weightings here. 13/03/2025
        };
      };
    };
    plot_preferences: {
      shared: {
        weight: number;
      };
      private: {
        weight: number;
      };
    };
  };
}

export interface IPostcodePreferenceMatrixD
  extends IPostcodePreferenceMatrix,
    Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPostcodePreferenceMatrixM
  extends Model<IPostcodePreferenceMatrixD> {}
