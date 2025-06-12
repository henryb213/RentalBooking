import { Types } from "mongoose";
import type {
  IListing,
  IListingD,
} from "@/types/marketplace/listing.interface";

/**
 * Generate mock listing data
 */
const _listingTypes: Array<"item" | "service" | "share"> = [
  "item",
  "service",
  "share",
];
export const createMockListing = (
  overrides?: Partial<IListing>,
  createdById?: string,
): IListing => {
  const createdBy = createdById
    ? new Types.ObjectId(createdById)
    : new Types.ObjectId();

  return {
    name: `Test Item ${Math.floor(Math.random() * 1000)}`,
    price: Math.floor(Math.random() * 100) + 1,
    quantity: Math.floor(Math.random() * 10) + 1,
    type: _listingTypes[Math.floor(Math.random() * _listingTypes.length)],
    category: "tools", // TODO : I still have no idea what the plan is here ~ J
    status: "open",
    imageUrls: [],
    description: "This is a test item for sale",
    taskboardId: new Types.ObjectId(),
    pickupmethod: "myloc",
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    postcode: "KY169SX",
    location: [0, 0],
    ...overrides,
  };
};

/**
 * Generate a mock listing document with _id
 * Returns a complete IListingD object suitable for database operations
 */
export const createMockListingDocument = (
  overrides?: Partial<IListing>,
  createdById?: string,
  id?: string,
): IListingD => {
  const listing = createMockListing(overrides, createdById);
  const _id = id ? new Types.ObjectId(id) : new Types.ObjectId();

  // Create the document with mongoose properties
  const listingDoc = {
    ...listing,
    _id,
  } as IListingD;

  // Add required mongoose document functions
  listingDoc.id = _id.toString();

  return listingDoc;
};

/**
 * Generate multiple mock listing documents
 */
export const createMockListingDocuments = (
  count: number,
  createdById?: string,
  overridesFn?: (index: number) => Partial<IListing>,
): IListingD[] => {
  return Array.from({ length: count }).map((_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockListingDocument(overrides, createdById);
  });
};
