import { connectDB } from "@/lib/mongo";
import { Listing } from "@/lib/models";
import { z } from "zod";
import {
  listingCreateSchema,
  listingUpdateSchema,
} from "@/lib/validations/marketplace/listing.schema";
import type {
  GetListingsOptions,
  IListing,
  IListingD,
  PopulatedListing,
} from "@/types/marketplace/listing.interface";
import type {
  PaginatedResponse,
  PaginationOptions,
} from "@/types/pagination.types";
import { UserService } from "./user.service";
import { TaskboardService } from "./task.service";
import { TRPCError } from "@trpc/server";
import { ITaskBoardD } from "@/types/taskManagement/task";
import { NotificationService } from "./notification.service";
import { mosaicService } from "./mosaic.service";

export class MarketService {
  static async createListing(
    input: z.infer<typeof listingCreateSchema>,
  ): Promise<IListing> {
    await connectDB();
    let taskboard: ITaskBoardD | null = null;

    if (input.type === "service") {
      const data = sanitizePath(input.path || "");
      taskboard = await TaskboardService.getByPath({
        path: data.path,
        title: data.title,
        owner: input.createdBy,
      });

      if (!taskboard) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Must provide a valid path to a taskboard",
        });
      }

      await TaskboardService.update({ _id: taskboard.id, listed: true });
    }

    const user = await UserService.getUserById(input.createdBy);
    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Must have a createdBy attribute",
      });
    }
    if (!user.address) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User must have an address to create listings",
      });
    }

    // postcode accessed from user data
    const postcode: string = user.address.postCode!;
    const postcode_data = await mosaicService.getPostcodeData(postcode);
    if (!postcode_data) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Listing must be from a group F postcode",
      });
    }

    const listing = await Listing.create<IListingD>({
      ...input,
      ...(input.type === "service" && taskboard
        ? { taskboardId: taskboard._id }
        : {}),
      location: [
        postcode_data.northings / 10000,
        postcode_data.eastings / 10000,
      ],
    });

    return listing.toObject();
  }

  static async getListingById(id: string): Promise<PopulatedListing | null> {
    await connectDB();

    const listing = await Listing.findById<PopulatedListing>(id)
      .populate("createdBy", "-passwordHash")
      .populate("purchasedBy", "-passwordHash")
      .exec();

    if (!listing) return null;

    return listing;
  }

  static async getListings(
    options: GetListingsOptions = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResponse<PopulatedListing>> {
    await connectDB();

    const { page = 1, limit = 10 } = pagination;

    const query: Record<string, unknown> = {};
    if (options.status) query.status = options.status;
    if (options.type) query.type = options.type;
    if (options.category) query.category = options.category;
    if (options.createdById) query.createdBy = options.createdById;
    if (options.purchasedById) query.purchasedBy = options.purchasedById;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("createdBy")
        .populate("purchasedBy")
        .sort(
          options.sort
            ? options.sort === "price:asc"
              ? { price: 1 }
              : options.sort === "price:desc"
                ? { price: -1 }
                : options.sort === "createdAt:asc"
                  ? { createdAt: 1 }
                  : options.sort === "status:open"
                    ? { status: -1 }
                    : { createdAt: -1 }
            : { createdAt: -1 },
        )
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<PopulatedListing[]>()
        .exec(),
      Listing.countDocuments(query).exec(),
    ]);

    return {
      data: listings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateListing(
    id: string,
    updates: z.infer<typeof listingUpdateSchema>,
  ): Promise<IListing | null> {
    await connectDB();
    let taskboard: ITaskBoardD | null = null;

    if (updates.path) {
      const listing: IListingD | null = await Listing.findById(id);
      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      const data = sanitizePath(updates.path || "");
      taskboard = await TaskboardService.getByPath({
        path: data.path,
        title: data.title,
        owner: listing.createdBy.toString(),
      });

      if (!taskboard) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Must provide a valid path to a taskboard",
        });
      }

      await TaskboardService.update({
        _id: listing.taskboardId.toString(),
        listed: false,
      });
      await TaskboardService.update({ _id: taskboard.id, listed: true });
    }
    // Create update object and add taskboardId if taskboard exists
    let updatedData;
    if (taskboard) {
      // Use type-safe approach with explicit property assignment
      updatedData = {
        ...updates,
        taskboardId: taskboard._id, // Use _id instead of id to match MongoDB document structure
      };
    } else {
      updatedData = {
        ...updates,
      };
    }
    delete updatedData.path;
    const listing = await Listing.findByIdAndUpdate<IListingD>(
      id,
      { $set: updatedData },
      { new: true, runValidators: true },
    )
      .populate("createdBy")
      .populate("purchasedBy")
      .exec();

    if (!listing) return null;
    return listing.toObject();
  }

  static async deleteListing(id: string): Promise<boolean> {
    await connectDB();
    const listing: IListingD | null = await Listing.findById(id);
    if (listing && listing.taskboardId) {
      await TaskboardService.update({
        _id: listing.taskboardId.toString(),
        listed: false,
      });
    }
    const result = await Listing.findByIdAndDelete(id);
    return result !== null;
  }

  static async searchListings(
    query: string,
    options: {
      limit?: number;
      status?: IListing["status"];
      type?: IListing["type"];
      category?: IListing["category"];
    } = {},
  ): Promise<PopulatedListing[]> {
    await connectDB();

    const { limit = 10, status, type, category } = options;

    const searchRegex = new RegExp(query, "i");
    const baseQuery: Record<string, unknown> = {
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    };

    const finalQuery = {
      ...baseQuery,
      ...(status && { status }),
      ...(type && { type }),
      ...(category && { category }),
    };

    const listings = await Listing.find(finalQuery)
      .populate("createdBy")
      .populate("purchasedBy")
      .limit(limit)
      .lean<PopulatedListing[]>();

    return listings;
  }

  static async purchaseListing(
    id: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    await connectDB();

    const listing = await Listing.findById<IListingD>(id);
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    if (listing.status === "closed") {
      return {
        success: false,
        error: "This listing has already been purchased",
      };
    }

    if (listing.createdBy._id.toString() === userId) {
      return { success: false, error: "You cannot purchase your own listing" };
    }

    const sellerId = listing.createdBy._id.toString();

    // Get buyer's current points
    const buyer = await UserService.getUserById(userId);
    if (!buyer || (buyer.points || 0) < listing.price) {
      return { success: false, error: "Insufficient funds to make purchase" };
    }

    try {
      // Deduct points from buyer
      const buyerUpdate = await UserService.updateUser(userId, {
        points: (buyer.points || 0) - listing.price,
      });
      if (!buyerUpdate) {
        return { success: false, error: "Failed to update buyer points" };
      }

      // Get seller's current points
      const seller = await UserService.getUserById(sellerId);
      if (!seller) {
        // Rollback buyer points if seller not found
        await UserService.updateUser(userId, { points: buyer.points });
        return { success: false, error: "Seller not found" };
      }

      // Add points to seller
      const sellerUpdate = await UserService.updateUser(sellerId, {
        points: (seller.points || 0) + listing.price,
      });
      if (!sellerUpdate) {
        // Rollback buyer points if seller update fails
        await UserService.updateUser(userId, { points: buyer.points });
        return { success: false, error: "Failed to update seller points" };
      }

      // Update listing status
      const newListing = await Listing.findByIdAndUpdate<IListingD>(
        id,
        { $set: { purchasedBy: userId, status: "closed" } },
        { new: true, runValidators: true },
      );

      if (!newListing) {
        // Rollback both transactions if listing update fails
        await UserService.updateUser(userId, { points: buyer.points });
        await UserService.updateUser(sellerId, { points: seller.points });
        return {
          success: false,
          error: "Failed to update listing status",
        };
      }

      // Create notifications for both buyer and seller
      await Promise.all([
        // Notify seller
        NotificationService.createNotification({
          userId: sellerId,
          type: "marketplace",
          title: "Listing Purchased",
          message: `Your listing "${listing.name}" has been purchased for ${listing.price} points.`,
          link: `/marketplace/item/${listing.id}`,
        }),
        // Notify buyer
        NotificationService.createNotification({
          userId: userId,
          type: "marketplace",
          title: "Purchase Successful",
          message: `You have successfully purchased "${listing.name}" for ${listing.price} points.`,
          link: `/marketplace/item/${listing.id}`,
        }),
      ]);

      return { success: true };
    } catch (error) {
      console.error("Transaction failed:", error);
      return {
        success: false,
        error: "Transaction failed, please try again",
      };
    }
  }
}

const sanitizePath = (path: string) => {
  let sanitizedPath = path || ""; // Will always be defined
  if (sanitizedPath.endsWith("/")) {
    sanitizedPath = sanitizedPath.slice(0, -1);
  }
  const pathParts = sanitizedPath.split("/");
  const fileName = pathParts.pop() || "";
  let directoryPath = "/" + pathParts.join("/");
  if (!directoryPath.endsWith("/")) {
    directoryPath += "/";
  }

  return {
    path: directoryPath,
    title: fileName,
  };
};
