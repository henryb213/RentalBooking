import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import { PlotsService } from "@/server/services/plots.service";
import {
  plotCreateSchema,
  plotUpdateSchema,
} from "@/lib/validations/plots/plots";
import { TaskboardService } from "@/server/services/task.service";

export const plotRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        member: z.string().optional(),
        owner: z.string().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
        status: z.enum(["available", "full", "maintenance"]).optional(),
        minSize: z.number().optional(),
        maxSize: z.number().optional(),
        location: z.string().optional(),
        condition: z.enum(["Full Sun", "Partial Sun", "No sun"]).optional(),
        soilPh: z
          .enum(["Neutral: 6.5 - 7.5", "Acidic: < 6.5", "Alkaline: > 7.5"])
          .optional(),
        soilType: z
          .enum(["Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"])
          .optional(),
        gardenSetting: z
          .enum(["Back garden", "Front garden", "Other"])
          .optional(),
        groupType: z.enum(["Communal", "Private"]).optional(),
        requiredTasks: z
          .array(
            z.object({
              tType: z.enum([
                "Watering",
                "Weeding",
                "Harvesting",
                "Planting",
                "Pruning",
                "Mowing",
                "Other",
              ]),
              frequency: z.enum(["Daily", "Weekly", "Monthly"]),
              duration: z.enum([
                "15-30 minutes",
                "30-60 minutes",
                "1-2 hours",
                "2-4 hours",
                "4+ hours",
              ]),
            }),
          )
          .optional(),
        plants: z
          .array(
            z.enum([
              "Perennial",
              "Shrubs",
              "Climbers",
              "Bulbs",
              "Mature-shrubs",
              "Grasses",
              "Flowers",
              "Ferns",
              "Fruit",
              "Herbs",
              "Vegetables",
              "Hedging",
              "Trees",
              "Indoor-plants",
              "Soil",
              "Seeds",
            ]),
          )
          .optional(),
        sortCriteria: z
          .enum([
            "Recommended For You",
            "Distance",
            "Newest",
            "Oldest",
            "Size: Descending",
            "Size: Ascending",
          ])
          .default("Recommended For You"),
      }),
    )
    .query(async ({ input }) => {
      const result = await PlotsService.getPlots({
        page: input.page,
        limit: input.limit,
        status: input.status,
        sortCriteria: input.sortCriteria,
        minSize: input.minSize,
        maxSize: input.maxSize,
        location: input.location,
        condition: input.condition,
        soilPh: input.soilPh,
        soilType: input.soilType,
        gardenSetting: input.gardenSetting,
        groupType: input.groupType,
        requiredTasks: input.requiredTasks,
        // @ts-expect-error checked types match
        plants: input.plants,
      });

      return result;
    }),

  create: publicProcedure
    .input(plotCreateSchema)
    .mutation(async ({ input }) => {
      const plot = await PlotsService.createPlot(input);
      const taskboard = await TaskboardService.create({
        owner: input.ownerId,
        path: "/plots/",
        title: input.name,
        plot: plot.plot._id.toString(),
      });
      return plot;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const plot = await PlotsService.getPlotById(input.id);
      return plot;
    }),

  getMyPopulatedPlots: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["lending", "tending", "both"]).default("both"),
      }),
    )
    .query(async ({ input }) => {
      const plots = await PlotsService.getMyPopulatedPlots(
        input.id,
        input.type,
      );
      return plots;
    }),

  update: publicProcedure
    .input(plotUpdateSchema)
    .mutation(async ({ input }) => {
      const plot = await PlotsService.updatePlot(input);
      return plot;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const taskboard = await TaskboardService.getTaskboardByPlotID({
        plotID: input.id,
      });
      if (taskboard) {
        await TaskboardService.delete({
          _id: (taskboard._id as mongoose.Types.ObjectId).toString(),
          flag: true,
        });
      }
      const result = await PlotsService.deletePlot(input.id);
      return result;
    }),

  acceptRequest: publicProcedure
    .input(
      z.object({
        plotId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await PlotsService.acceptJoinRequest(
        input.plotId,
        input.userId,
      );
      return result;
    }),

  sendRequest: publicProcedure
    .input(
      z.object({
        plotId: z.string(),
        userId: z.string(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await PlotsService.addJoinRequest(
        input.plotId,
        input.userId,
        input.message,
      );
      return result;
    }),

  unassign: publicProcedure
    .input(
      z.object({
        plotId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await PlotsService.unassignMember(
        input.plotId,
        input.userId,
      );
      return result;
    }),

  removeSelf: publicProcedure
    .input(
      z.object({
        plotId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await PlotsService.unassignMember(
        input.plotId,
        input.userId,
      );
      return result;
    }),

  rejectRequest: publicProcedure
    .input(
      z.object({
        plotId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { plotId, userId } = input;

      await PlotsService.rejectJoinRequest(plotId, userId);

      return { success: true };
    }),
});
