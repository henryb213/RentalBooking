import { Types } from "mongoose";
import type { IUser, IUserD } from "@/types/user";

/**
 * Generate mock user data
 */
export const createMockUser = (overrides?: Partial<IUser>): IUser => {
  return {
    email: `user_${Math.floor(Math.random() * 10000)}@example.com`,
    passwordHash: "hashedpassword12345",
    firstName: "Test",
    lastName: "User",
    points: 100,
    notificationCount: 0,
    role: "communityMember",
    profile: {
      bio: "Test user bio",
      skills: ["gardening", "composting"],
      interests: ["organic farming", "sustainability"],
    },
    address: {
      street: "123 Test Street",
      city: "Testville",
      region: "Testshire",
      postCode: "TE12 3ST",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    verified: true,
    favouritePlots: [],
    firstGardenJoined: false,
    firstGardenLent: false,
    ...overrides,
  };
};

/**
 * Generate a mock user document with _id
 * Returns a complete IUserD object suitable for database operations
 */
export const createMockUserDocument = (
  overrides?: Partial<IUser>,
  id?: string,
): IUserD => {
  const user = createMockUser(overrides);
  const _id = id ? new Types.ObjectId(id) : new Types.ObjectId();

  // Create the document with mongoose properties
  const userDoc = {
    ...user,
    _id,
  } as IUserD;

  // Add required mongoose document functions
  userDoc.id = _id.toString();

  return userDoc;
};

/**
 * Generate multiple mock user documents
 */
export const createMockUserDocuments = (
  count: number,
  overridesFn?: (index: number) => Partial<IUser>,
): IUserD[] => {
  return Array.from({ length: count }).map((_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockUserDocument(overrides);
  });
};
