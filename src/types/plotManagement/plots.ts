import mongoose, { Document, Model } from "mongoose";
import { IUserD } from "../user";

export type PopulatedPlot = Omit<
  IPlot,
  "owner.userId" | "members" | "requests"
> & {
  owner: Omit<IUserD, "passwordHash">;
  members: {
    userId: Omit<IUserD, "passwordHash">;
    joinedDate: Date;
  }[];
  requests: {
    userId: Omit<IUserD, "passwordHash">;
    sentAt: Date;
    message: string;
  }[];
};

export interface IPlot {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  size: number;
  location: string;
  status: "available" | "full" | "maintenance";
  soilPh: "Neutral: 6.5 - 7.5" | "Acidic: < 6.5" | "Alkaline: > 7.5";
  soilType: "Sand" | "Clay" | "Silt" | "Peat" | "Chalk" | "Loam";
  condition: "Full Sun" | "Partial Sun" | "No sun";
  gardenSetting: "Back garden" | "Front garden" | "Other";
  groupType: "Communal" | "Private";
  requiredTasks: {
    tType:
      | "Watering"
      | "Weeding"
      | "Harvesting"
      | "Planting"
      | "Pruning"
      | "Mowing"
      | "Other";
    frequency: "Daily" | "Weekly" | "Monthly";
    duration:
      | "15-30 minutes"
      | "30-60 minutes"
      | "1-2 hours"
      | "2-4 hours"
      | "4+ hours";
  }[];
  plants:
    | "Perennial"
    | "Shrubs"
    | "Climbers"
    | "Bulbs"
    | "Mature-shrubs"
    | "Grasses"
    | "Flowers"
    | "Ferns"
    | "Fruit"
    | "Herbs"
    | "Vegetables"
    | "Hedging"
    | "Trees"
    | "Indoor-plants"
    | "Soil"
    | "Seeds"[];
  owner: mongoose.Types.ObjectId; //userID
  memberLimit: number;
  members: IUserEntry[];
  requests: IJoinRequest[];
  history: IPlotHistory[];
  images: IImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlotLocation {
  latitude: number;
  longitude: number;
  country: "England" | "Scotland" | "Northern Ireland" | "Wales";
}

export interface IUserEntry {
  userId: mongoose.Types.ObjectId;
  joinedDate: Date;
}

export interface IJoinRequest {
  userId: mongoose.Types.ObjectId;
  message: string;
  sentAt: Date;
}

// TODO: add to history?
export interface IPlotHistory {
  action: "created" | "assigned" | "unassigned" | "maintenance" | "requested";
  userId: mongoose.Types.ObjectId;
  date: Date;
}

export interface IImage {
  url: string;
  isMain: boolean;
}

// @ts-expect-error works
export interface IPlotD extends IPlot, Document {}

// eslint-disable-next-line
export interface IPlotM extends Model<IPlotD> {}

export type GetPlotsOptions = {
  member?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
  minSize?: number;
  maxSize?: number;
  location?: string;
  status?: IPlot["status"];
  condition?: IPlot["condition"];
  soilPh?: IPlot["soilPh"];
  soilType?: IPlot["soilType"];
  gardenSetting?: IPlot["gardenSetting"];
  groupType?: IPlot["groupType"];
  requiredTasks?: IPlot["requiredTasks"];
  plants?: IPlot["plants"];
  sortCriteria:
    | "Recommended For You"
    | "Distance"
    | "Newest"
    | "Oldest"
    | "Size: Descending"
    | "Size: Ascending";
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// Define the Plot model, either use the existing one or create a new one if it doesn't exist
// @ts-expect-error works
const Plot = mongoose.models.Plot || mongoose.model<IPlot>("Plot", plotSchema);

export default Plot;
