import { Document, Model } from "mongoose";

export interface IUserProfile {
  bio?: string;
  avatar?: string;
  skills?: string[];
  interests?: string[];
}

export interface IUserAddress {
  street?: string;
  city?: string;
  region?: string;
  postCode?: string;
}

export interface IUser {
  email: string;
  passwordHash: string;
  points: number;
  notificationCount: number;
  firstName: string;
  lastName: string;
  role: "admin" | "plotOwner" | "communityMember";
  profile?: IUserProfile;
  address?: IUserAddress;
  createdAt: Date;
  updatedAt: Date;
  favouritePlots: string[];

  /* Flags for earning points for joining/lending their first garden */
  firstGardenJoined: boolean;
  firstGardenLent: boolean;

  verified: boolean;
}

export interface IUserD extends IUser, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserM extends Model<IUserD> {}

export type GetUsersOptions = {
  page?: number;
  limit?: number;
  role?: IUser["role"];
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
