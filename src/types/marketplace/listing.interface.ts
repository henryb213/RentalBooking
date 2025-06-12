import type { Model, Types, Document } from "mongoose";
import { IUserD } from "@/types/user";

export interface IListing {
  name: string;
  price: number;
  quantity?: number;
  type: "item" | "service" | "share";
  category: string;
  status: "open" | "closed";
  imageUrls: string[];
  description: string;
  taskboardId: Types.ObjectId;
  pickupmethod: "myloc" | "post";
  createdBy: Types.ObjectId;
  purchasedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  postcode: string;
  location: [number, number];
}

export interface IListingD extends IListing, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IListingM extends Model<IListingD> {}

export interface GetListingsOptions {
  status?: IListing["status"];
  type?: IListing["type"];
  category?: IListing["category"];
  createdById?: string;
  purchasedById?: string;
  sort?:
    | "price:asc"
    | "price:desc"
    | "createdAt:asc"
    | "createdAt:desc"
    | "status:open";
}

export type PopulatedListing = Omit<IListingD, "createdBy" | "purchasedBy"> & {
  createdBy: Omit<IUserD, "passwordHash">;
  purchasedBy?: Omit<IUserD, "passwordHash">;
};
