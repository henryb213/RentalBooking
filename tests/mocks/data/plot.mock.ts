import { Types } from "mongoose";
import type { IPlot, IPlotD } from "@/types/plotManagement/plots";

// Adapted from listing.mock.ts

/**
 * Generate mock plot data
 */
export const createMockListing = (
  overrides?: Partial<IPlot>,
  createdById?: string,
): IPlot => {
  const owner = createdById
    ? new Types.ObjectId(createdById)
    : new Types.ObjectId();

  return {
    name: `Test Plot ${Math.floor(Math.random() * 1000)}`,
    size: Math.floor(Math.random() * 100) + 1,
    status: "available",
    location: "KY169SX",
    soilPh: "Neutral: 6.5 - 7.5",
    soilType: "Loam",
    condition: "Full Sun",
    gardenSetting: "Back garden",
    groupType: "Communal",
    requiredTasks: [],
    plants: [],
    images: [],
    description: "This is a test plot for sharing",
    owner,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as IPlot;
};

/**
 * Generate a mock listing document with _id
 * Returns a complete IPlotD object suitable for database operations
 */
export const createMockPlotDocument = (
  overrides?: Partial<IPlot>,
  createdById?: string,
  id?: string,
): IPlotD => {
  const plot = createMockListing(overrides, createdById);
  const _id = id ? new Types.ObjectId(id) : new Types.ObjectId();

  // Create the document with mongoose properties
  const plotDoc = {
    ...plot,
    _id,
  } as IPlotD;

  // Add required mongoose document functions
  plotDoc.id = _id.toString();

  return plotDoc;
};

/**
 * Generate multiple mock listing documents
 */
export const createMockPlotDocuments = (
  count: number,
  createdById?: string,
  overridesFn?: (index: number) => Partial<IPlot>,
): IPlotD[] => {
  return Array.from({ length: count }).map((_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockPlotDocument(overrides, createdById);
  });
};

/* const createMockPlotPlot = (overrides = {}) => {
  const defaultPlot = {
    name: "Test Garden Plot",
    description: "A beautiful garden plot for testing",
    size: 100,
    location: "KY169SX",
    condition: "Full Sun",
    soilPh: "Neutral: 6.5 - 7.5",
    soilType: "Loam",
    owner: new Types.ObjectId(),
    members: [],
    images: [],
    memberLimit: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaultPlot,
    ...overrides,
  };
};

module.exports = createMockPlotDocument; */
