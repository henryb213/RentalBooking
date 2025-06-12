import { mosaicService } from "@/server/services/mosaic.service";
import * as testHelper from "../../helpers/test-service-helper";
import { IPostcodePreferenceMatrix, IPostcodeType } from "@/types/mosaic";

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
  const dat = await testHelper.createTestListings(
    50,
    undefined,
    undefined,
    "ky",
  );
}, 10000);

// Clean data between tests
afterEach(async () => {});

// Clean up after all tests
afterAll(async () => {
  await testHelper.cleanupTestEnvironment();
});

const mock_demographic: IPostcodePreferenceMatrix = {
  groupType: "22",
  timestamp: new Date(),
  expiry_date: undefined,
  preferences: {
    listing_preferences: {
      item: {
        weight: 0.5,
      },
      service: {
        weight: 0.5,
      },
      share: {
        weight: 0.0,
      },
    },
    plot_preferences: {
      shared: {
        weight: 0.5,
      },
      private: {
        weight: 0.5,
      },
    },
  },
};

describe("MosaicService", () => {
  describe("getPostcodeData", () => {
    it("should return IPostcodeType[]", async () => {
      const res: IPostcodeType | undefined =
        await mosaicService.getPostcodeData("KY14 EA");
      expect(res).not.toBeUndefined();
      if (res) {
        expect(res.type).toBe("24");
        expect(res.group).toBe("F");
      }
    });
  });
  describe("getMarketRecommendations", () => {
    it("should return a non-zero amount of content", async () => {
      const res = await mosaicService.getMarketRecommendations("KY14EA");
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });
    it("should return dynamically weighted content", async () => {
      const res = await mosaicService.getMarketRecommendations(
        "KY14EA",
        undefined,
        undefined,
        mock_demographic,
      );

      const totals = res.data.reduce(
        (t, l) => {
          if (l.type === "item") t.items++;
          else if (l.type === "service") t.services++;
          else if (l.type === "share") t.shares++;
          return t;
        },
        { items: 0, services: 0, shares: 0 },
      );
      const total = totals.items + totals.services + totals.shares;
      expect(total).not.toBe(0);
      expect(totals.items / total).toBeGreaterThanOrEqual(
        mock_demographic.preferences.listing_preferences.item.weight,
      );
      expect(totals.shares / total).toBeGreaterThanOrEqual(
        mock_demographic.preferences.listing_preferences.share.weight,
      );
      expect(totals.services / total).toBeGreaterThanOrEqual(
        mock_demographic.preferences.listing_preferences.service.weight,
      );
    });
  });
});
