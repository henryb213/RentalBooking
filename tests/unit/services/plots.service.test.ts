import { PlotsService } from "@/server/services/plots.service";
import { GetPlotsOptions, IPlotD } from "@/types/plotManagement/plots";
import { IPlot } from "@/types/plotManagement/plots";
import * as testHelper from "../../helpers/test-service-helper";
import { Types } from "mongoose";

// Mock the FolderService to break dependency chain
jest.mock("@/server/services/folder.service", () => {
  return {
    FolderService: {
      getIdByPath: jest.fn().mockResolvedValue({ _id: "mockFolderId" }),
      createFolder: jest.fn().mockResolvedValue({ _id: "newFolderId" }),
      deleteFolder: jest.fn().mockResolvedValue(true),
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

describe("PlotsService", () => {
  describe("createPlot", () => {
    it("should throw an error when user is not found", async () => {
      const plotData = {
        name: "Test Plot",
        description: "A test garden plot",
        size: 100,
        location: "KY169SX",
        condition: "Full Sun" as IPlot["condition"],
        soilPh: "Neutral: 6.5 - 7.5" as IPlot["soilPh"],
        soilType: "Loam" as IPlot["soilType"],
        ownerId: new Types.ObjectId().toString(),
        images: [],
        gardenSetting: "Back garden" as IPlot["gardenSetting"],
        groupType: "Communal" as IPlot["groupType"],
      };

      await expect(PlotsService.createPlot(plotData)).rejects.toThrow(
        "Invalid ownerId, user not found",
      );
    });

    it("should create a plot successfully", async () => {
      const user = await testHelper.createTestUser();

      const plotData = {
        name: "Test Plot",
        description: "A test garden plot",
        size: 100,
        location: "KY169SX",
        condition: "Full Sun" as IPlot["condition"],
        soilPh: "Neutral: 6.5 - 7.5" as IPlot["soilPh"],
        soilType: "Loam" as IPlot["soilType"],
        ownerId: user.id,
        images: [],
        gardenSetting: "Back garden" as IPlot["gardenSetting"],
        groupType: "Communal" as IPlot["groupType"],
      };
      const result = await PlotsService.createPlot(plotData);

      // Check if the plot was created successfully
      expect(result.plot).not.toBeNull();
      expect(result.plot.name).toBe("Test Plot");
      expect(result.plot.owner.toString()).toBe(user.id);
      expect(result.message).toContain("Garden plot created successfully");
    });
  });

  describe("getPlotById", () => {
    it("should return a plot by id", async () => {
      const testPlot = await testHelper.createTestPlot();
      const plotId = testPlot.id;

      const foundPlot = await PlotsService.getPlotById(plotId);

      // Check if the plot was found
      expect(foundPlot).not.toBeNull();
      expect(foundPlot?.name).toBe(testPlot.name);
      expect(foundPlot?.size).toBe(testPlot.size);
      expect(foundPlot?.description).toBe(testPlot.description);
    });

    // Check if the plot is not found
    it("should return null for non-existent plot id", async () => {
      const result = await PlotsService.getPlotById(
        new Types.ObjectId().toString(),
      );
      expect(result).toBeNull();
    });
  });

  describe("getMyPlots", () => {
    it("should return plots for a user", async () => {
      const user = await testHelper.createTestUser();
      await testHelper.createTestPlots(3, user.id);

      const plots = await PlotsService.getMyPlots(user.id);

      expect(plots).toHaveLength(3);
    });

    it("should return an empty array for non-existent user", async () => {
      const plots = await PlotsService.getMyPlots(
        new Types.ObjectId().toString(),
      );
      expect(plots).toHaveLength(0);
    });

    it("should return an empty array for user with no plots", async () => {
      const user = await testHelper.createTestUser();
      const plots = await PlotsService.getMyPlots(user.id);
      expect(plots).toHaveLength(0);
    });
  });

  describe("getMyPopulatedPlots", () => {
    it("should return populated plots for a user that they're lending", async () => {
      const user = await testHelper.createTestUser();
      const plots = await testHelper.createTestPlots(3, user.id);

      const populatedPlots = await PlotsService.getMyPopulatedPlots(
        user.id,
        "lending",
      );

      expect(populatedPlots).toHaveLength(3);
      expect(populatedPlots[0].owner._id.toString()).toEqual(user.id);
    });

    it("should return populated plots for a user that they're tending", async () => {
      const user = await testHelper.createTestUser();
      const overrides: Partial<IPlot> = {
        members: [
          {
            userId: user.id,
            joinedDate: new Date(),
          },
        ],
      };
      const plot = await testHelper.createTestPlot(overrides, user.id);

      const populatedPlots = await PlotsService.getMyPopulatedPlots(
        user.id,
        "tending",
      );

      expect(populatedPlots).toHaveLength(1);
      expect(populatedPlots[0].name).toEqual(plot.name);
    });

    it("should return all populated plots for a user - both lending and tending", async () => {
      const user = await testHelper.createTestUser();
      const lendingPlots = await testHelper.createTestPlots(3, user.id);
      const overrides: Partial<IPlot> = {
        members: [
          {
            userId: user.id,
            joinedDate: new Date(),
          },
        ],
      };
      const tendingPlots = await testHelper.createTestPlot(overrides, user.id);

      const populatedPlots = await PlotsService.getMyPopulatedPlots(
        user.id,
        "both",
      );
    });
  });
  describe("getPlots", () => {
    it("should return paginated plots with default options", async () => {
      await testHelper.createTestPlots(10);

      const page = 1;
      const limit = 5;
      const result = await PlotsService.getPlots({
        sortCriteria: "Recommended For You",
        page,
        limit,
      });

      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
    });

    it("should return filtered plots based on status", async () => {
      const user = await testHelper.createTestUser();
      await testHelper.createTestPlots(5, user.id, (index: number) => ({
        status: "available",
      }));
      await testHelper.createTestPlots(3, user.id, (index: number) => ({
        status: "full",
      }));

      const page = 1;
      const limit = 5;
      const status = "available";
      const result = await PlotsService.getPlots({
        sortCriteria: "Recommended For You",
        page,
        limit,
        status,
      });

      expect(result.data).toHaveLength(5);
      result.data.forEach((plot) => {
        expect(plot.status).toBe("available");
      });
    });

    it("should return sorted plots by size in descending order", async () => {
      await testHelper.createTestPlots(5);

      const options = {
        sortCriteria: "Size: Descending" as GetPlotsOptions["sortCriteria"],
        page: 1,
        limit: 5,
      };

      const result = await PlotsService.getPlots(options);

      expect(result.data).toHaveLength(5);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i - 1].size).toBeGreaterThanOrEqual(
          result.data[i].size,
        );
      }
    });

    it("should return an empty array when no plots match the filters", async () => {
      const options = {
        location: "NonExistentLocation",
        page: 1,
        limit: 5,
        sortCriteria: "Recommended For You" as GetPlotsOptions["sortCriteria"],
      };

      const result = await PlotsService.getPlots(options);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should handle pagination correctly", async () => {
      await testHelper.createTestPlots(12);

      const options = {
        page: 2,
        limit: 5,
        sortCriteria: "Recommended For You" as GetPlotsOptions["sortCriteria"],
      };

      const result = await PlotsService.getPlots(options);

      expect(result.data).toHaveLength(5);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(12);
    });
  });

  describe("updatePlot", () => {
    it("should update a plot successfully", async () => {
      const testPlot = await testHelper.createTestPlot();
      const plotId = testPlot.id;

      const updateData = {
        id: plotId,
        name: "Updated Plot",
        description: "A test garden plot",
        size: 200,
        location: "KY169SX",
        condition: "Full Sun" as IPlot["condition"],
        soilPh: "Neutral: 6.5 - 7.5" as IPlot["soilPh"],
        soilType: "Loam" as IPlot["soilType"],
        ownerId: new Types.ObjectId().toString(),
        images: [],
        gardenSetting: "Back garden" as IPlot["gardenSetting"],
        groupType: "Communal" as IPlot["groupType"],
      };

      const result = await PlotsService.updatePlot(updateData);

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Updated Plot");
      expect(result?.size).toBe(200);
    });

    it("should return null when updating non-existent plot", async () => {
      const updateData = {
        id: new Types.ObjectId().toString(),
        name: "Updated Plot",
        description: "A test garden plot",
        size: 200,
        location: "KY169SX",
        condition: "Full Sun" as IPlot["condition"],
        soilPh: "Neutral: 6.5 - 7.5" as IPlot["soilPh"],
        soilType: "Loam" as IPlot["soilType"],
        ownerId: new Types.ObjectId().toString(),
        images: [],
        gardenSetting: "Back garden" as IPlot["gardenSetting"],
        groupType: "Communal" as IPlot["groupType"],
      };

      const result = await PlotsService.updatePlot(updateData);
      expect(result).toBeNull();
    });
  });

  describe("deletePlot", () => {
    it("should delete a plot successfully", async () => {
      const testPlot = await testHelper.createTestPlot();
      const plotId = testPlot.id;

      const deleteResult = await PlotsService.deletePlot(plotId);

      expect(deleteResult).toBe(true);
      const checkPlot = await PlotsService.getPlotById(plotId);
      expect(checkPlot).toBeNull();
    });

    it("should return false when deleting non-existent plot", async () => {
      const result = await PlotsService.deletePlot(
        new Types.ObjectId().toString(),
      );
      expect(result).toBe(false);
    });
  });

  describe("addJoinRequest", () => {
    it("should throw an error if the user does not exist", async () => {
      const plotId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(
        PlotsService.addJoinRequest(plotId, userId, "I want to join this plot"),
      ).rejects.toThrow("Invalid ownerId, user not found");
    });

    it("should throw an error if the plot does not exist", async () => {
      const user = await testHelper.createTestUser();
      const plotId = new Types.ObjectId().toString();

      await expect(
        PlotsService.addJoinRequest(
          plotId,
          user.id,
          "I want to join this plot",
        ),
      ).rejects.toThrow("Plot not found");
    });

    it("should throw an error if the owner tries to send a join request", async () => {
      const user = await testHelper.createTestUser();
      const plot = await testHelper.createTestPlot({}, user.id);

      await expect(
        PlotsService.addJoinRequest(
          plot.id,
          user.id,
          "I want to join this plot",
        ),
      ).rejects.toThrow("Owners cannot send requests to join their own plot");
    });

    it("should throw an error if the user has already sent a join request", async () => {
      const user = await testHelper.createTestUser();
      const plot = await testHelper.createTestPlot(
        {},
        new Types.ObjectId().toString(),
      );

      await PlotsService.addJoinRequest(
        plot.id,
        user.id,
        "I want to join this plot",
      );

      await expect(
        PlotsService.addJoinRequest(
          plot.id,
          user.id,
          "I want to join this plot",
        ),
      ).rejects.toThrow("You've already sent a request to join this garden!");
    });

    it("should throw an error if the user is already a member of the plot", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        members: [
          {
            userId: user.id,
            joinedDate: new Date(),
          },
        ],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      await expect(
        PlotsService.addJoinRequest(
          plot.id,
          user.id,
          "I want to join this plot",
        ),
      ).rejects.toThrow("You're already a member of this garden!");
    });

    it("should add a join request successfully", async () => {
      const user = await testHelper.createTestUser();
      const plot = await testHelper.createTestPlot(
        {},
        new Types.ObjectId().toString(),
      );

      const result = await PlotsService.addJoinRequest(
        plot.id,
        user.id,
        "I want to join this plot",
      );

      expect(result.message).toBe("Join request sent successfully");

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.requests).toHaveLength(1);
      expect(updatedPlot?.requests[0].userId.toString()).toBe(user.id);
      expect(updatedPlot?.requests[0].message).toBe("I want to join this plot");
    });
  });

  describe("acceptJoinRequest", () => {
    it("should throw an error if the user does not exist", async () => {
      const plotId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(
        PlotsService.acceptJoinRequest(plotId, userId),
      ).rejects.toThrow("Invalid userId, user not found");
    });

    it("should throw an error if the plot does not exist", async () => {
      const user = await testHelper.createTestUser();
      const plotId = new Types.ObjectId().toString();

      await expect(
        PlotsService.acceptJoinRequest(plotId, user.id),
      ).rejects.toThrow("Plot not found");
    });

    it("should throw an error if the join request is not found", async () => {
      const user = await testHelper.createTestUser();
      const plot = await testHelper.createTestPlot(
        {},
        new Types.ObjectId().toString(),
      );

      await expect(
        PlotsService.acceptJoinRequest(plot.id, user.id),
      ).rejects.toThrow("Request not found");
    });

    it("should throw an error if the plot is already full", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        requests: [
          {
            userId: user.id,
            sentAt: new Date(),
          },
        ] as IPlot["requests"],
        status: "full" as IPlot["status"],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      await expect(
        PlotsService.acceptJoinRequest(plot.id, user.id),
      ).rejects.toThrow(
        "This plot already has the maximum number of users assigned to it",
      );
    });

    it("should throw an error if the plot is under maintenance", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        requests: [
          {
            userId: user.id,
            sentAt: new Date(),
          },
        ] as IPlot["requests"],
        status: "maintenance" as IPlot["status"],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      await expect(
        PlotsService.acceptJoinRequest(plot.id, user.id),
      ).rejects.toThrow("This plot is under maintenance");
    });

    it("should accept a join request successfully", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        requests: [
          {
            userId: user.id,
            sentAt: new Date(),
          },
        ] as IPlot["requests"],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      const result = await PlotsService.acceptJoinRequest(plot.id, user.id);

      expect(result.message).toBe("User accepted successfully");

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.requests).toHaveLength(0);
      expect(updatedPlot?.members).toHaveLength(1);
      expect(updatedPlot?.members[0].userId.toString()).toBe(user.id);
    });

    it("should update the plot status to full if the member limit is reached", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        requests: [
          {
            userId: user.id,
            sentAt: new Date(),
          },
        ] as IPlot["requests"],
        memberLimit: 1,
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      const result = await PlotsService.acceptJoinRequest(plot.id, user.id);

      expect(result.message).toBe("User accepted successfully");

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.status).toBe("full");
    });
  });

  describe("unassignMember", () => {
    it("should throw an error if the plot does not exist", async () => {
      const plotId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(PlotsService.unassignMember(plotId, userId)).rejects.toThrow(
        "Plot not found",
      );
    });

    it("should throw an error if the user is not a member of the plot", async () => {
      const user = await testHelper.createTestUser();
      const plot = await testHelper.createTestPlot(
        {},
        new Types.ObjectId().toString(),
      );

      await expect(
        PlotsService.unassignMember(plot.id, user.id),
      ).rejects.toThrow("User not in members");
    });

    it("should unassign a member successfully", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        members: [
          {
            userId: user.id,
            joinedDate: new Date(),
          },
        ],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      const result = await PlotsService.unassignMember(plot.id, user.id);

      expect(result.message).toBe("User unassigned successfully");

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.members).toHaveLength(0);
    });

    it("should update the plot status to available if it was full", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        members: [
          {
            userId: user.id,
            joinedDate: new Date(),
          },
        ] as IPlot["members"],
        status: "full" as IPlot["status"],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      const result = await PlotsService.unassignMember(plot.id, user.id);

      expect(result.message).toBe("User unassigned successfully");

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.status).toBe("available");
    });
  });

  describe("rejectJoinRequest", () => {
    it("should remove a join request successfully", async () => {
      const user = await testHelper.createTestUser();
      const overrides = {
        requests: [
          {
            userId: user.id,
            sentAt: new Date(),
          },
        ] as IPlot["requests"],
      };
      const plot = await testHelper.createTestPlot(
        overrides,
        new Types.ObjectId().toString(),
      );

      await PlotsService.rejectJoinRequest(plot.id, user.id);

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.requests).toHaveLength(0);
    });

    it("should not throw an error if the join request does not exist", async () => {
      const plot = await testHelper.createTestPlot(
        {},
        new Types.ObjectId().toString(),
      );
      const userId = new Types.ObjectId().toString();

      await expect(
        PlotsService.rejectJoinRequest(plot.id, userId),
      ).resolves.not.toThrow();

      const updatedPlot = await PlotsService.getPlotById(plot.id);
      expect(updatedPlot?.requests).toHaveLength(0);
    });

    it("should throw an error if the plot does not exist", async () => {
      const plotId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      await expect(
        PlotsService.rejectJoinRequest(plotId, userId),
      ).rejects.toThrow();
    });
  });
});
