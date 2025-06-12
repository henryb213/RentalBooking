import { connectDB } from "@/lib/mongo";
import { Plot, User } from "@/lib/models";
import {
  plotCreateSchema,
  plotUpdateSchema,
} from "@/lib/validations/plots/plots";
import { z } from "zod";
import {
  IPlot,
  GetPlotsOptions,
  PaginatedResponse,
} from "@/types/plotManagement/plots";
import mongoose, { Types, SortOrder } from "mongoose";
import { FolderService } from "./folder.service";
import { UserService } from "./user.service";
import { NotificationService } from "./notification.service";
import {
  createFolderSchema,
  getIdByPathSchema,
} from "@/lib/validations/folder";
import { PopulatedPlot } from "@/types/plotManagement/plots";

export class PlotsService {
  static async createPlot(
    input: z.infer<typeof plotCreateSchema>,
  ): Promise<{ plot: IPlot; message: string }> {
    await connectDB();

    // Checks if user exists
    const user = await UserService.getUserById(input.ownerId);

    // Returns error if user not found
    if (!user) {
      throw new Error("Invalid ownerId, user not found");
    }

    let message = "Garden plot created successfully";

    // Check if this is the user's first plot
    if (!user.firstGardenLent) {
      // Update user points
      await UserService.updateUser(input.ownerId, {
        points: user.points + 10,
        firstGardenLent: true,
      });

      const notification = await NotificationService.createNotification({
        userId: input.ownerId,
        title: "1st Garden Listed",
        message:
          "Congratulations! You've just listed your first garden. You have been awarded 10 points.",
        type: "points",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires in 7 days
        link: `/plots/management/my-plots`,
      });

      if (!notification) {
        message = "Notification create error";
      }
    }

    // Create a new plot
    const plot = await Plot.create({
      name: input.name,
      description: input.description,
      size: Number(input.size),
      location: input.location,
      condition: input.condition,
      soilPh: input.soilPh,
      soilType: input.soilType,
      groupType: input.groupType,
      gardenSetting: input.gardenSetting === "" ? "Other" : input.gardenSetting,
      requiredTasks: input.requiredTasks,
      plants: input.plants,
      owner: input.ownerId,

      // default memberlimit is defined by the garden type
      memberLimit: input.groupType === "Communal" ? 30 : 1,
      images:
        input.images && input.images.length > 0
          ? input.images
          : [
              {
                url: "https://stech-personal-uni.s3.eu-west-1.amazonaws.com/cs3099-public/uploads/1743417796358_home.png",
                isMain: true,
              },
            ],

      status: "available",
      members: [],
      requests: [],
      history: [],
    });

    const root = await FolderService.getIdByPath({
      path: "/plots/",
      createdBy: input.ownerId,
    });

    const plotfolderInput: z.infer<typeof createFolderSchema> = {
      name: "plots",
      createdBy: input.ownerId,
      path: "/plots/",
      //@ts-expect-error id is never null
      parentFolderId: root._id || "",
    };
    await FolderService.createFolder(plotfolderInput);
    return { plot: plot, message: message };
  }

  static async getPlotById(id: string): Promise<PopulatedPlot | null> {
    await connectDB();
    const plot = await Plot.findById<PopulatedPlot>(id)
      .populate("owner", "-passwordHash")
      .populate("members", "-passwordHash")
      .populate("requests", "-passwordHash")
      .exec();

    if (!plot) return null;

    return plot;
  }

  static async getMyPlots(userId: string): Promise<Types.ObjectId[]> {
    await connectDB();
    const plots = await Plot.find({
      $or: [{ "members.userId": userId }, { owner: userId }],
    }).lean<IPlot[]>();
    return plots.map((plot) => plot._id);
  }

  static async getMyPopulatedPlots(
    userId: string,
    type: "lending" | "tending" | "both",
  ): Promise<PopulatedPlot[]> {
    await connectDB();
    let user;
    // convert to objectId
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = new mongoose.Types.ObjectId(userId);
    }

    let plots;

    // works, no touching
    if (type === "lending") {
      plots = await Plot.find({
        $or: [{ owner: user }],
      })
        .populate("owner", "-passwordHash")
        .populate("members.userId", "-passwordHash")
        .populate("requests.userId", "-passwordHash")
        .lean<PopulatedPlot[]>();
    } else if (type === "tending") {
      plots = await Plot.find({
        $or: [{ "members.userId": user }],
      })
        .populate("owner", "-passwordHash")
        .populate("members.userId", "-passwordHash")
        .populate("requests.userId", "-passwordHash")
        .lean<PopulatedPlot[]>();
    } else {
      plots = await Plot.find({
        $or: [{ "members.userId": user }, { owner: user }],
      })
        .populate("owner", "-passwordHash")
        .populate("members.userId", "-passwordHash")
        .populate("requests.userId", "-passwordHash")
        .lean<PopulatedPlot[]>();
    }

    return plots;
  }

  static async getPlots(
    options: GetPlotsOptions,
  ): Promise<PaginatedResponse<IPlot>> {
    await connectDB();
    const { page = 1, limit = 5, status, sortCriteria } = options;

    // Construct query object based on filters
    type QueryValue =
      | string
      | unknown
      | { $lte: number; $gte: number }
      | { $lte: number }
      | { $gte: number };
    const query: Record<string, QueryValue> = {};
    /* if (options.ownerId && mongoose.Types.ObjectId.isValid(options.ownerId)) {
      query.owner = new mongoose.Types.ObjectId(options.ownerId);
    } */
    if (status) query.status = status;
    if (options.minSize !== undefined && options.maxSize !== undefined) {
      query.size = {
        $lte: Number(options.maxSize),
        $gte: Number(options.minSize),
      };
    } else if (options.minSize !== undefined) {
      query.size = { $gte: Number(options.minSize) };
    } else if (options.maxSize !== undefined) {
      query.size = { $lte: Number(options.maxSize) };
    }
    if (options.condition) query.condition = options.condition;
    if (options.location)
      query.location = { $regex: options.location, $options: "i" };
    if (options.soilPh) query.soilPh = options.soilPh;
    if (options.soilType) query.soilType = options.soilType;
    if (options.gardenSetting) query.gardenSetting = options.gardenSetting;
    if (options.groupType) query.groupType = options.groupType;
    if (options.requiredTasks) query.requiredTasks = options.requiredTasks;
    if (options.plants) query.plants = options.plants;

    // TODO: test by adding a member by owner
    //if (options.member) { query.members = {userId: options.member} }

    const [plots, total] = await Promise.all([
      Plot.find(query)
        .sort(this.sortQuery(sortCriteria))
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IPlot[]>(),
      Plot.countDocuments(query),
    ]);

    return {
      data: plots,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static sortQuery(sortCriteria: string): { [key: string]: SortOrder } {
    switch (sortCriteria) {
      case "Recommended For You":
      case "Distance":
      case "Newest":
        return { createdAt: -1 };
      case "Oldest":
        return { createdAt: 1 };
      case "Size: Descending":
        return { size: -1 };
      case "Size: Ascending":
        return { size: 1 };
      default:
        return { createdAt: -1 };
    }
  }

  static async updatePlot(
    updates: z.infer<typeof plotUpdateSchema>,
  ): Promise<IPlot | null> {
    await connectDB();

    const plot = await Plot.findByIdAndUpdate(
      updates.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!plot) {
      return null;
    }

    return plot;
  }

  static async deletePlot(id: string): Promise<boolean> {
    await connectDB();
    const plot = await PlotsService.getPlotById(id);
    const result = await Plot.findByIdAndDelete(id);
    return result !== null;
  }

  // TODO: improve error handling
  /* Add's a JoinRequest object to the garden */
  static async addJoinRequest(
    plotId: string,
    userId: string,
    message?: string,
  ) {
    await connectDB();

    // Checks if user exists
    const userExists = await User.exists({ _id: userId }).exec();

    // Returns error if user not found
    if (!userExists) {
      throw new Error("Invalid ownerId, user not found");
    }

    // get plot
    const plot = await Plot.findById(plotId);
    if (!plot) throw new Error("Plot not found");

    // Owners can't send requests
    if (plot.owner.toString() === userId)
      throw new Error("Owners cannot send requests to join their own plot");

    type Entry = {
      userId: mongoose.Types.ObjectId;
      sentAt: Date;
    };

    // Check if user has already sent a request
    const userSentRequest = plot.requests.some(
      (entry: Entry) => entry.userId.toString() === userId,
    );
    if (userSentRequest) {
      throw new Error("You've already sent a request to join this garden!");
    }

    // Check if the user is already in the member list
    const userInMembers = plot.members.some(
      (entry: Entry) => entry.userId.toString() === userId,
    );
    if (userInMembers) {
      throw new Error("You're already a member of this garden!");
    }

    // Add JoinRequest
    plot.requests.push({
      userId: userId,
      date: new Date(),
      message: message || "",
    });

    // Add history entry
    plot.history.push({
      action: "requested",
      userId: userId,
      date: new Date(),
    });

    await NotificationService.createNotification({
      userId: plot.owner,
      title: "New join request",
      message: "You have a new join request for " + plot.name,
      type: "misc",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires in 7 days
      link: `/plots/management/my-plots`,
    });

    // Update plots
    await plot.save();
    return { message: "Join request sent successfully" };
  }

  /* Accepts a JoinRequest object, adding the respective user to the list of members */
  static async acceptJoinRequest(plotId: string, userId: string) {
    await connectDB();

    // Checks if user exists
    const user = await UserService.getUserById(userId);

    // Returns error if user not found
    if (!user) {
      throw new Error("Invalid userId, user not found");
    }

    // get plot
    const plot = await Plot.findById(plotId);
    if (!plot) throw new Error("Plot not found");

    // Defines the Entry type, so entries in array can be checked by userID
    type Entry = {
      userId: mongoose.Types.ObjectId;
      joinedDate: Date;
    };

    // Gets index of user's request
    const index = plot.requests.findIndex(
      (item: Entry) => item.userId.toString() === userId,
    );
    if (index === -1) {
      throw new Error("Request not found");
    }

    // Remove from requests
    plot.requests.splice(index, 1);

    // Check if the plot is already full
    if (plot.status === "full") {
      throw new Error(
        "This plot already has the maximum number of users assigned to it",
      );
    }

    // Check if the plot is under maintenance
    if (plot.status === "maintenance") {
      throw new Error("This plot is under maintenance");
    }

    // Update plot with the new member and change status if necessary
    plot.members.push({
      userId: userId,
      joinedDate: new Date(),
    });

    if (plot.memberLimit === plot.members.length) plot.status = "full";

    // Add history entry
    plot.history.push({
      action: "assigned",
      userId: userId,
      date: new Date(),
    });

    const notification = await NotificationService.createNotification({
      userId: userId,
      title: "Join request accepted",
      message: "Congratulations! You have been accepted to " + plot.name,
      type: "misc",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires in 7 days
      link: `/plots/management/my-plots`,
    });
    // Check if this is the user's first plot they have joined
    if (!user.firstGardenJoined) {
      // Update user points
      await UserService.updateUser(userId, {
        points: user.points + 50,
        firstGardenJoined: true,
      });

      const notification = await NotificationService.createNotification({
        userId: userId,
        title: "1st Garden Joined",
        message:
          "Congratulations! You've just joined your first garden. You have been awarded 50 points.",
        type: "points",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // expires in 7 days
        link: `/plots/management/my-plots`,
      });

      if (!notification) {
        throw new Error("Notification create error");
      }
    }

    // Update plots
    await plot.save();
    return { message: "User accepted successfully" };
  }

  /* Unassign a member from a plot */
  static async unassignMember(plotId: string, userId: string) {
    await connectDB();

    // Find the plot by ID
    const plot = await Plot.findById(plotId);
    if (!plot) {
      throw new Error("Plot not found");
    }

    // Defines the Entry type, so entries in array can be checked by userID
    type Entry = {
      userId: mongoose.Types.ObjectId;
      joinedDate: Date;
    };

    // Gets index of user in members, and removes user from members
    const index = plot.members.findIndex(
      (item: Entry) => item.userId.toString() === userId,
    );
    if (index === -1) {
      throw new Error("User not in members");
    }

    // Remove from members
    plot.members.splice(index, 1);

    // Check if plots is no longer full
    if (plot.status === "full") plot.status = "available";

    // Add history entry
    plot.history.push({
      action: "unassigned",
      userId: userId,
      date: new Date(),
    });

    await plot.save();

    return { message: "User unassigned successfully" };
  }

  static async rejectJoinRequest(
    plotId: string,
    userId: string,
  ): Promise<void> {
    const plot = await Plot.updateOne(
      { _id: plotId },
      { $pull: { requests: { userId } } }, // Remove the request with the specified userId
    );
    if (plot.modifiedCount === 0) {
      throw new Error("Request not found or already rejected");
    }
    if (!plot) {
      throw new Error("Plot not found");
    }
  }
}
