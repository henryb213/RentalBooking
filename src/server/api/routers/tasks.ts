import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TaskService } from "@/server/services/task.service";

import {
  createSchema,
  deleteSchema,
  getAllSchema,
  getByIDSchema,
  getNumberOfTasksSchema,
  toggleImportanceSchema,
  toggleStatusSchema,
  updateSchema,
} from "@/lib/validations/task";

export const taskRouter = createTRPCRouter({
  getTasksByBoard: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        page: z.number().min(1),
        limit: z.number().min(1),
      }),
    )
    .query(async ({ input }) => {
      const tasks = await TaskService.getTasksByBoard(input);
      return tasks;
    }),

  getAll: publicProcedure.input(getAllSchema).query(async ({ input }) => {
    const tasks = await TaskService.getAll(input);
    return tasks;
  }),

  create: publicProcedure.input(createSchema).mutation(async ({ input }) => {
    const inserted = await TaskService.create(input);
    return inserted;
  }),

  getById: publicProcedure.input(getByIDSchema).query(async ({ input }) => {
    const task = await TaskService.getById(input);
    return task;
  }),

  // Should return the number of tasks based on whatever criteria is passed
  getNumberOfTasks: publicProcedure
    .input(getNumberOfTasksSchema)
    .query(async ({ input }) => {
      const count = await TaskService.getNumberOfTasks({
        ...input,
      });
      return { total: count };
    }),

  update: publicProcedure.input(updateSchema).mutation(async ({ input }) => {
    const updated = await TaskService.update(input);
    return updated;
  }),

  toggleStatus: publicProcedure
    .input(toggleStatusSchema)
    .mutation(async ({ input }) => {
      const updated = await TaskService.toggleStatus(input);
      return updated;
    }),

  toggleImportance: publicProcedure
    .input(toggleImportanceSchema)
    .mutation(async ({ input }) => {
      const updated = await TaskService.toggleImportance(input);
      return updated;
    }),

  delete: publicProcedure.input(deleteSchema).mutation(async ({ input }) => {
    const deleted = await TaskService.delete(input);
    return deleted;
  }),

  addComment: publicProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    )
    .mutation(({ input }) => {
      // Implementation here
      return { task: input };
    }),
});
