import fs from "fs";
import path from "path";
import csv from "csv-parser";
import * as dbHandler from "../mocks/db-handler";
import { User } from "@/lib/models/user.model";
import { Listing } from "@/lib/models/listing.model";
import { Plot } from "@/lib/models/plot.model";
import { createMockUserDocument } from "../mocks/data/user.mock";
import { createMockListingDocument } from "../mocks/data/listing.mock";
import { createMockPlotDocument } from "../mocks/data/plot.mock";
import { IUser, IUserD } from "@/types/user";
import { IListing, IListingD } from "@/types/marketplace/listing.interface";
import { IPlot, IPlotD } from "@/types/plotManagement/plots";
import { mosaicService } from "@/server/services/mosaic.service";

/**
 * Initialize the testing environment
 */
export const initializeTestEnvironment = async (): Promise<void> => {
  try {
    await dbHandler.connect();
  } catch (error: unknown) {
    console.error("Failed to initialize test environment:", error);
    throw error;
  }
};

/**
 * Clean up the testing environment
 */
export const cleanupTestEnvironment = async (): Promise<void> => {
  try {
    await dbHandler.clearDatabase();
    await dbHandler.closeDatabase();
  } catch (error: unknown) {
    console.error("Failed to clean up test environment:", error);
    throw error;
  }
};

/**
 * Clean database between tests
 */
export const clearTestData = async (): Promise<void> => {
  try {
    await dbHandler.clearDatabase();
  } catch (error: unknown) {
    console.error("Failed to clear test data:", error);
    throw error;
  }
};

/**
 * Create a test user
 */
export const createTestUser = async (
  overrides: Partial<IUser> = {},
): Promise<IUserD> => {
  try {
    const mockUser = createMockUserDocument(overrides);
    mockUser.address!.postCode = await getRandomFPostcode("ab");
    return await new User(mockUser).save();
  } catch (error: unknown) {
    console.error("Failed to create test user:", error);
    throw error;
  }
};

/**
 * Create a test plot
 */
export const createTestPlot = async (
  overrides: Partial<IPlot> = {},
  createdById?: string,
  postcode_prefix?: string,
): Promise<IPlotD> => {
  try {
    const userId = createdById || (await createTestUser()).id;
    const mockPlot = createMockPlotDocument(overrides, userId);

    return await new Plot(mockPlot).save();
  } catch (error: unknown) {
    console.error("Failed to create test listing:", error);
    throw error;
  }
};

/**
 * Create multiple test plots
 */
export const createTestPlots = async (
  count: number,
  createdById?: string,
  overridesFn?: (index: number) => Partial<IPlot>,
  postcode_prefix?: string,
): Promise<IPlotD[]> => {
  try {
    const plots: IPlotD[] = [];
    const userId = createdById || (await createTestUser()).id;

    for (let i = 0; i < count; i++) {
      const overrides = overridesFn ? overridesFn(i) : {};
      plots.push(await createTestPlot(overrides, userId, postcode_prefix));
    }

    return plots;
  } catch (error: unknown) {
    console.error("Failed to create test listings:", error);
    throw error;
  }
};

/**
 * Get a random group F postcode
 */
export const getRandomFPostcode = async (prefix?: string): Promise<string> => {
  const dirPath = path.resolve(__dirname, "../../src/data/processed/postcodes");
  const suffix = prefix ? prefix + ".csv" : ".csv";
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(suffix));

  if (files.length === 0) {
    console.error("No processed postcode files found.");
    throw new Error("No processed postcodes in dir.");
  }

  const rand = files[Math.floor(Math.random() * files.length)];
  const file = path.join(dirPath, rand);

  return new Promise((resolve, reject) => {
    const rows: string[] = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", (data) => {
        rows.push(data["Postcode"]);
      })
      .on("end", () => {
        const res = rows[Math.floor(Math.random() * rows.length)];
        resolve(res);
      })
      .on("error", (e) => {
        reject(e);
      });
  });
};

/**
 * Create a test listing
 */
export const createTestListing = async (
  overrides: Partial<IListing> = {},
  createdById?: string,
  postcode_prefix?: string,
): Promise<IListingD> => {
  try {
    const _postcode = await getRandomFPostcode(postcode_prefix);
    const postcode = "AB123HF";
    const postcode_data = await mosaicService.getPostcodeData(postcode);
    if (!postcode_data)
      throw Error(`No postcode_data for postcode: ${postcode}`);

    const coords: [number, number] = !postcode_data.northings
      ? [0, 0]
      : [
          Number(postcode_data.northings) / 10000,
          Number(postcode_data.eastings) / 10000,
        ];

    const userId = createdById || (await createTestUser()).id;
    const mockListing = createMockListingDocument(overrides, userId);

    mockListing.postcode = postcode;
    mockListing.location = coords;

    return await new Listing(mockListing).save();
  } catch (error: unknown) {
    console.error("Failed to create test listing:", error);
    throw error;
  }
};

/**
 * Create multiple test users
 */
export const createTestUsers = async (
  count: number,
  overridesFn?: (index: number) => Partial<IUser>,
): Promise<IUserD[]> => {
  try {
    const users: IUserD[] = [];
    for (let i = 0; i < count; i++) {
      const overrides = overridesFn ? overridesFn(i) : {};
      users.push(await createTestUser(overrides));
    }
    return users;
  } catch (error: unknown) {
    console.error("Failed to create test users:", error);
    throw error;
  }
};

/**
 * Create multiple test listings
 */
export const createTestListings = async (
  count: number,
  createdById?: string,
  overridesFn?: (index: number) => Partial<IListing>,
  postcode_prefix?: string,
): Promise<IListingD[]> => {
  try {
    const listings: IListingD[] = [];
    const userId = createdById || (await createTestUser()).id;

    for (let i = 0; i < count; i++) {
      const overrides = overridesFn ? overridesFn(i) : {};
      listings.push(
        await createTestListing(overrides, userId, postcode_prefix),
      );
      // console.log(`Pushed test listing ${i}`);
    }

    return listings;
  } catch (error: unknown) {
    console.error("Failed to create test listings:", error);
    throw error;
  }
};
