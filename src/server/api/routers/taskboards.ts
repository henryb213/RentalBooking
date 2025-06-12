import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getMostRecentSchema,
  getAllTaskboardSchema,
  createTaskboardSchema,
  deleteTaskboardSchema,
  updateTaskboardSchema,
} from "@/lib/validations/taskboard";
import { z } from "zod";
import {
  TaskboardService,
  TaskFolderService,
} from "@/server/services/task.service";
import { TRPCError } from "@trpc/server";
import { ITaskBoardD } from "@/types/taskManagement/task";

export const taskBoardRouter = createTRPCRouter({
  // return up to the 5 most recently updated tasks for a user
  getMostRecent: publicProcedure
    .input(getMostRecentSchema)
    .query(async ({ input }) => {
      try {
        const taskboards = await TaskboardService.getMostRecent(input);
        return { taskBoards: taskboards };
      } catch (error) {
        console.error("Error fetching recent taskboards:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recent taskboards",
          cause: error,
        });
      }
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const taskboard = await TaskboardService.getById(input);

        if (!taskboard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No taskboard found with ID: ${input.id}`,
          });
        }

        return taskboard.toObject();
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch taskboard",
          cause: error,
        });
      }
    }),

  getAllTaskFolders: publicProcedure
    .input(getAllTaskboardSchema)
    .query(async ({ input }) => {
      const res = await TaskFolderService.getAllFolderTasks(input);
      return res;
    }),

  getAll: publicProcedure
    .input(getAllTaskboardSchema)
    .query(async ({ input }) => {
      const res = await TaskboardService.getAll(input);
      return res;
    }),

  update: publicProcedure
    .input(updateTaskboardSchema)
    .mutation(async ({ input }) => {
      try {
        const taskboard: ITaskBoardD | null = await TaskboardService.getById({
          id: input._id,
        });
        if (!taskboard) return;
        if (taskboard?.listed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Taskboard " +
              input._id +
              " is listed on the marketplace, please delete the listing to delete the taskboard",
          });
        }
        const new_taskboard = await TaskboardService.update(input);
        if (!new_taskboard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No taskboard found with ID: ${input._id}`,
          });
        }
        return new_taskboard;
      } catch (error) {
        console.error("Error updating taskboard:", error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update taskboard",
          cause: error,
        });
      }
    }),

  getByPlot: publicProcedure
    .input(
      z.object({
        plotID: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const taskboard = await TaskboardService.getTaskboardByPlotID(input);
        if (!taskboard) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No taskboard found for plot ID: ${input.plotID}`,
          });
        }
        return taskboard;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch taskboard by plot ID",
          cause: error,
        });
      }
    }),

  create: publicProcedure
    .input(createTaskboardSchema)
    .mutation(async ({ input }) => {
      try {
        // if (
        //   input.path === "/plots/" ||
        //   input.path.match(/^\/plots\/[^\/]+\//)
        // ) {
        //   throw new TRPCError({
        //     code: "FORBIDDEN",
        //     message: "Cannot add taskboard to plots",
        //   });
        // }
        const taskboard = await TaskboardService.create(input);
        return taskboard;
      } catch (error) {
        console.error("Error creating taskboard:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create taskboard",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(deleteTaskboardSchema)
    .mutation(async ({ input }) => {
      try {
        const taskboard: ITaskBoardD | null = await TaskboardService.getById({
          id: input._id,
        });
        if (!taskboard) return;
        if (taskboard?.listed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Taskboard " +
              input._id +
              " is listed on the marketplace, please delete the listing to delete the taskboard",
          });
        }
        let res;
        try {
          res = await TaskboardService.delete(input);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("[PLOT_LINKED]")
          ) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message:
                "This taskboard cannot be deleted because it is linked to a plot",
            });
          }
        }
        if (!res) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Failed to delete taskboard: ${input._id}`,
          });
        }
        return res;
      } catch (error) {
        console.error("Error deleting taskboard:", error);
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete taskboard",
          cause: error,
        });
      }
    }),
});
