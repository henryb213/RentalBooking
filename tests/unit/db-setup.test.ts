import mongoose from "mongoose";
import * as dbHandler from "../mocks/db-handler";
import { User } from "@/lib/models/user.model";
import { Listing } from "@/lib/models/listing.model";
import { createMockUserDocument } from "../mocks/data/user.mock";
import { createMockListingDocument } from "../mocks/data/listing.mock";

/**
 * Connect to a new in-memory database before running any tests
 */
beforeAll(async () => {
  await dbHandler.connect();
});

/**
 * Clear all test data after every test
 */
afterEach(async () => {
  await dbHandler.clearDatabase();
});

/**
 * Remove and close the db and server.
 */
afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe("Database Setup Test", () => {
  it("should connect to in-memory database", () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it("should save a user to the database", async () => {
    // Create a mock user
    const mockUser = createMockUserDocument();

    // Save the user to the database
    await new User(mockUser).save();

    // Query the database for the user
    const users = await User.find({});

    // Check that the user was saved
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(mockUser.email);
  });

  it("should save a listing to the database", async () => {
    // Create a mock user
    const mockUser = createMockUserDocument();
    const savedUser = await new User(mockUser).save();

    // Create a mock listing
    const mockListing = createMockListingDocument({}, savedUser._id.toString());
    console.log(mockListing.location);

    // Save the listing to the database
    await new Listing(mockListing).save();

    // Query the database for the listing
    const listings = await Listing.find({});

    // Check that the listing was saved
    expect(listings).toHaveLength(1);
    expect(listings[0].name).toBe(mockListing.name);
    expect(listings[0].createdBy.toString()).toBe(savedUser._id.toString());
  });
});
