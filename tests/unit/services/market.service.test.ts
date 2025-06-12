import { MarketService } from "@/server/services/market.service";
import * as testHelper from "../../helpers/test-service-helper";
import { Types } from "mongoose";
import { UserService } from "@/server/services/user.service";
import { mosaicService } from "@/server/services/mosaic.service";

// Mock the TaskboardService to break the dependency chain
jest.mock("@/server/services/task.service", () => {
  const { createMockTaskBoardDocument } = jest.requireActual(
    "../../mocks/data/task.mock",
  );
  const mockTaskBoard = createMockTaskBoardDocument({
    title: "Mock Taskboard",
    path: "/mock/taskboard",
    status: "open",
  });

  return {
    TaskboardService: {
      getByPath: jest.fn().mockResolvedValue(mockTaskBoard),
      update: jest.fn().mockResolvedValue(true),
    },
  };
});

// Setup test environment with in-memory MongoDB
beforeAll(async () => {
  await testHelper.initializeTestEnvironment();
});

// Clean data between tests
afterEach(async () => {
  await testHelper.clearTestData();
});

// Clean up after all tests
afterAll(async () => {
  await testHelper.cleanupTestEnvironment();
});

describe("MarketService", () => {
  describe("createListing", () => {
    it("should create a listing successfully", async () => {
      // Create a user first for the createdBy field
      const user = await testHelper.createTestUser();
      const postcode = await testHelper.getRandomFPostcode();
      console.log(`creating a listing for postcode: ${postcode}`);
      const postcode_data = await mosaicService.getPostcodeData(postcode);
      const coords = [postcode_data?.northings, postcode_data?.eastings];
      // Prepare listing data
      const listingData = {
        name: "Test Item",
        price: 25,
        quantity: 1,
        type: "item" as const,
        category: "tools",
        status: "open" as const,
        imageUrls: [],
        description: "This is a test item for sale",
        pickupmethod: "myloc" as const,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        postcode: postcode,
        location: coords,
      };

      // Create the listing
      const listing = await MarketService.createListing(listingData);

      // Verify listing was created with correct data
      expect(listing).not.toBeNull();
      expect(listing.name).toBe("Test Item");
      expect(listing.price).toBe(25);
      expect(listing.category).toBe("tools");
      expect(listing.status).toBe("open");
      expect(listing.createdBy.toString()).toBe(user.id);
      expect(listing.postcode).not.toBeNull();
      expect(listing.location).not.toBe([0, 0]);
    });
  });

  describe("getListingById", () => {
    it("should return a listing by id", async () => {
      // Create a test listing
      const testListing = await testHelper.createTestListing();
      const listingId = testListing.id;

      // Test getListingById method
      const foundListing = await MarketService.getListingById(listingId);

      // Verify listing was found
      expect(foundListing).not.toBeNull();
      expect(foundListing?.name).toBe(testListing.name);
      expect(foundListing?.price).toBe(testListing.price);
      expect(foundListing?.description).toBe(testListing.description);
    });

    it("should return null for non-existent listing id", async () => {
      const result = await MarketService.getListingById(
        new Types.ObjectId().toString(),
      );
      expect(result).toBeNull();
    });
  });

  describe("getListings", () => {
    it("should return paginated listings", async () => {
      // Create multiple test listings
      await testHelper.createTestListings(5);

      // Get listings with pagination
      const result = await MarketService.getListings(
        { status: "open" },
        { page: 1, limit: 3 },
      );

      // Verify pagination
      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.pages).toBe(2);
    });

    it("should filter listings by category", async () => {
      // Create listings with different categories
      const user = await testHelper.createTestUser();
      await testHelper.createTestListing({ category: "tools" }, user.id);
      await testHelper.createTestListing({ category: "seeds" }, user.id);
      await testHelper.createTestListing({ category: "plants" }, user.id);

      // Get listings filtered by category
      const result = await MarketService.getListings({ category: "seeds" });

      // Verify filtering
      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe("seeds");
    });

    it("should filter listings by createdBy", async () => {
      // Create users
      const user1 = await testHelper.createTestUser();
      const user2 = await testHelper.createTestUser();

      // Create listings by different users
      await testHelper.createTestListing({}, user1.id);
      await testHelper.createTestListing({}, user2.id);

      // Get listings by user1
      const result = await MarketService.getListings({ createdById: user1.id });

      // Verify filtering
      expect(result.data).toHaveLength(1);
      expect(result.data[0].createdBy).toBeTruthy();
      // @ts-expect-error - we know it's a mongoose object
      expect(result.data[0].createdBy._id.toString()).toBe(user1.id.toString());
    });
  });

  describe("updateListing", () => {
    it("should update a listing successfully", async () => {
      // Create a test listing
      const testListing = await testHelper.createTestListing();
      const listingId = testListing.id;

      // Update data
      const updateData = {
        name: "Updated Item Name",
        price: 50,
        description: "Updated description",
      };

      // Update the listing
      const updatedListing = await MarketService.updateListing(
        listingId,
        updateData,
      );

      // Verify update
      expect(updatedListing).not.toBeNull();
      expect(updatedListing?.name).toBe("Updated Item Name");
      expect(updatedListing?.price).toBe(50);
      expect(updatedListing?.description).toBe("Updated description");

      // Verify original fields remain unchanged
      expect(updatedListing?.status).toBe(testListing.status);
      expect(updatedListing?.category).toBe(testListing.category);
    });

    it("should return null when updating non-existent listing", async () => {
      const result = await MarketService.updateListing(
        new Types.ObjectId().toString(),
        { price: 100 },
      );
      expect(result).toBeNull();
    });
  });

  describe("deleteListing", () => {
    it("should delete a listing successfully", async () => {
      // Create a test listing
      const testListing = await testHelper.createTestListing();
      const listingId = testListing.id;

      // Delete the listing
      const deleteResult = await MarketService.deleteListing(listingId);

      // Verify deletion
      expect(deleteResult).toBe(true);

      // Verify listing no longer exists
      const checkListing = await MarketService.getListingById(listingId);
      expect(checkListing).toBeNull();
    });

    it("should return false when deleting non-existent listing", async () => {
      const result = await MarketService.deleteListing(
        new Types.ObjectId().toString(),
      );
      expect(result).toBe(false);
    });
  });

  describe("searchListings", () => {
    it("should find listings by search query", async () => {
      // Create listings with searchable content
      await testHelper.createTestListing({
        name: "Gardening Tools Set",
        description: "Complete set of gardening tools",
      });
      await testHelper.createTestListing({
        name: "Organic Seeds",
        description: "Assorted organic vegetable seeds",
      });
      await testHelper.createTestListing({
        name: "Plant Fertilizer",
        description: "Organic plant food and fertilizer",
      });

      // Search for "organic"
      const results = await MarketService.searchListings("organic");

      // Verify search results
      expect(results.length).toBe(2);
      expect(results.some((item) => item.name === "Organic Seeds")).toBe(true);
      expect(results.some((item) => item.name === "Plant Fertilizer")).toBe(
        true,
      );
    });

    it("should limit search results as requested", async () => {
      // Create multiple test listings
      await testHelper.createTestListings(5, undefined, (i) => ({
        name: `Test Tool ${i + 1}`,
        category: "tools",
      }));

      // Search with limit
      const results = await MarketService.searchListings("tool", { limit: 2 });

      // Verify limit is applied
      expect(results.length).toBe(2);
    });
  });

  describe("purchaseListing", () => {
    it("should successfully purchase a listing", async () => {
      // Create seller with listing
      const seller = await testHelper.createTestUser({ points: 0 });
      const listing = await testHelper.createTestListing(
        {
          price: 50,
          status: "open",
        },
        seller.id,
      );

      // Create buyer with sufficient points
      const buyer = await testHelper.createTestUser({ points: 100 });

      // Purchase the listing
      const result = await MarketService.purchaseListing(listing.id, buyer.id);

      // Verify purchase success
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify listing status update
      const updatedListing = await MarketService.getListingById(listing.id);
      expect(updatedListing?.status).toBe("closed");
      expect(updatedListing?.purchasedBy).toBeTruthy();
      // @ts-expect-error - we know it's a mongoose object
      expect(updatedListing?.purchasedBy._id.toString()).toBe(
        buyer.id.toString(),
      );

      // Verify points transfer
      const updatedBuyer = await UserService.getUserById(buyer.id);
      const updatedSeller = await UserService.getUserById(seller.id);
      expect(updatedBuyer?.points).toBe(50); // 100 - 50
      expect(updatedSeller?.points).toBe(50); // 0 + 50
    });

    it("should fail when buyer has insufficient points", async () => {
      // Create seller with listing
      const seller = await testHelper.createTestUser();
      const listing = await testHelper.createTestListing(
        { price: 100 },
        seller.id,
      );

      // Create buyer with insufficient points
      const buyer = await testHelper.createTestUser({ points: 50 });

      // Attempt purchase
      const result = await MarketService.purchaseListing(listing.id, buyer.id);

      // Verify purchase failure
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient funds to make purchase");

      // Verify listing status remains unchanged
      const checkListing = await MarketService.getListingById(listing.id);
      expect(checkListing?.status).toBe("open");
      expect(checkListing?.purchasedBy).toBeUndefined();
    });

    it("should not allow purchasing your own listing", async () => {
      // Create user with listing
      const user = await testHelper.createTestUser({ points: 100 });
      const listing = await testHelper.createTestListing({}, user.id);

      // Attempt to purchase own listing
      const result = await MarketService.purchaseListing(listing.id, user.id);

      // Verify purchase failure
      expect(result.success).toBe(false);
      expect(result.error).toBe("You cannot purchase your own listing");
    });

    it("should fail when listing is already purchased", async () => {
      // Create users
      const seller = await testHelper.createTestUser();
      const buyer1 = await testHelper.createTestUser({ points: 100 });
      const buyer2 = await testHelper.createTestUser({ points: 100 });

      // Create and purchase listing
      const listing = await testHelper.createTestListing(
        { price: 50 },
        seller.id,
      );
      await MarketService.purchaseListing(listing.id, buyer1.id);

      // Second buyer attempts purchase
      const result = await MarketService.purchaseListing(listing.id, buyer2.id);

      // Verify purchase failure
      expect(result.success).toBe(false);
      expect(result.error).toBe("This listing has already been purchased");
    });

    it("should fail when listing doesn't exist", async () => {
      const buyer = await testHelper.createTestUser({ points: 100 });
      const result = await MarketService.purchaseListing(
        new Types.ObjectId().toString(),
        buyer.id,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Listing not found");
    });
  });
});
