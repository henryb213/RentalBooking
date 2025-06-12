import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import {
  allToolsSchema,
  getToolByIdSchema,
  createToolSchema,
  returnToolSchema,
  borrowToolSchema,
  updateToolSchema,
} from "@/lib/validations/tools";
import { ToolService } from "@/server/services/tool.service";

export const toolRouter = createTRPCRouter({
  getAll: publicProcedure.input(allToolsSchema).query(async ({ input }) => {
    const tools = await ToolService.getAllTools(input);
    return tools;
  }),

  create: publicProcedure
    .input(createToolSchema)
    .mutation(async ({ input }) => {
      const inserted = await ToolService.createTool(input);
      return inserted;
    }),

  getToolByID: publicProcedure
    .input(getToolByIdSchema)
    .query(async ({ input }) => {
      const tool = await ToolService.getToolById(input.id);
      return tool;
    }),

  updateTool: publicProcedure
    .input(updateToolSchema)
    .mutation(async ({ input }) => {
      const updatedTool = await ToolService.updateTool(input);
      return updatedTool;
    }),

  borrowTool: publicProcedure
    .input(borrowToolSchema)
    .mutation(async ({ input }) => {
      const borrowedTool = await ToolService.borrowTool(input);
      return borrowedTool;
    }),

  returnTool: publicProcedure
    .input(returnToolSchema)
    .mutation(async ({ input }) => {
      const returnedTool = await ToolService.returnTool(input);
      return returnedTool;
    }),
});
