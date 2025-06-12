import { connectDB } from "@/lib/mongo";
import { Folder, User, Listing } from "@/lib/models";
import { hash } from "bcryptjs";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations/user";
import { z } from "zod";
import {
  IUser,
  IUserD,
  GetUsersOptions,
  PaginatedResponse,
} from "@/types/user";
import { IFolderD } from "@/types/folder";
import { PopulatedListing } from "@/types/marketplace/listing.interface";

export class UserService {
  static async createUser(
    input: z.infer<typeof userCreateSchema>,
  ): Promise<Omit<IUser, "passwordHash">> {
    await connectDB();

    // Validate input against schema
    // const validatedInput = userCreateSchema.parseAsync(input);

    const existingUser = await User.findOne<IUserD>({
      email: input.email,
    }).exec();
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hash(input.password, 12);

    const user = await User.create<IUserD>({
      ...input,
      passwordHash: hashedPassword,
      profile: {
        skills: [],
        interests: [],
        ...input.profile,
      },
    });

    // Abstract somewhere else or just delete
    const folder = await Folder.create<IFolderD>({
      path: "/",
      name: "/",
      createdBy: user.toObject()._id,
    });
    await Folder.create<IFolderD>({
      path: "/plots/",
      name: "plots",
      createdBy: user.toObject()._id,
      parentFolderId: folder.toObject()._id,
    });

    return this.sanitizeUser(user);
  }

  static async getUserById(
    id: string,
    excludePassword = true,
  ): Promise<IUser | Omit<IUser, "passwordHash"> | null> {
    await connectDB();

    const user = await User.findById<IUserD>(id).exec();

    if (!user) return null;

    if (excludePassword) {
      return this.sanitizeUser(user.toObject());
    }

    return user.toObject();
  }

  static async getUserByEmail(
    email: string,
    excludePassword = true,
  ): Promise<IUser | Omit<IUser, "passwordHash"> | null> {
    await connectDB();

    const user = await User.findOne<IUserD>({ email }).exec();

    if (!user) return null;

    if (excludePassword) return this.sanitizeUser(user.toObject());

    return user.toObject();
  }

  static async getUsers(
    options: GetUsersOptions = {},
  ): Promise<PaginatedResponse<IUser>> {
    await connectDB();

    const { page = 1, limit = 10, role } = options;
    const query = role ? { role } : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IUser[]>(),
      User.countDocuments(query).exec(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUser(
    id: string,
    updates: z.infer<typeof userUpdateSchema>,
  ) {
    await connectDB();

    // If email is being updated, check it's not taken
    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: id },
      }).exec();

      if (existingUser) {
        throw new Error("Email already in use");
      }
    }

    const user = await User.findByIdAndUpdate<IUserD>(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).exec();

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user.toObject());
  }

  static async deleteUser(id: string): Promise<boolean> {
    await connectDB();

    const result = await User.findByIdAndDelete(id).exec();
    return result !== null;
  }

  static async searchUsers(
    query: string,
    options: {
      limit?: number;
      role?: IUser["role"];
    } = {},
  ) {
    await connectDB();

    const { limit = 10, role } = options;

    const searchRegex = new RegExp(query, "i");
    const baseQuery = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ],
    };

    const finalQuery = role ? { ...baseQuery, role } : baseQuery;

    const users = await User.find(finalQuery)
      .select("-passwordHash")
      .limit(limit)
      .lean<IUser[]>();

    return users;
  }

  /**
   * Get all of a user's listings
   * @param userId the user's ID
   * @returns all the user's listings, even if there are no listings
   */
  static async getUserListings(userId: string): Promise<PopulatedListing[]> {
    await connectDB();

    // Try to find listings created by the user
    try {
      const listings = await Listing.find({ createdBy: userId })
        .sort({ createdAt: -1 }) // sort by the most recent upload
        .lean<PopulatedListing[]>()
        .exec();

      return listings;
    } catch (error) {
      console.error("Error fetching user listings", error);
      throw new Error("Failed to fetch listings");
    }
  }

  private static sanitizeUser(user: IUser): Omit<IUser, "passwordHash"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
