import { z } from "zod";
import { paginationSchema } from "@/lib/validations/api";

export const allToolsSchema = z.object({
  ...paginationSchema.shape,
  category: z.string().optional(),
  availability: z.enum(["available", "borrowed"]).optional(),
  condition: z.enum(["new", "excellent", "good", "fair", "poor"]).optional(),
});

export const createToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  condition: z.enum(["new", "excellent", "good", "fair", "poor"]),
  ownerId: z.string(),
});

export const getToolByIdSchema = z.object({ id: z.string() });

export const updateToolSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(["excellent", "good", "fair", "poor"]).optional(),
  availability: z.enum(["available", "borrowed"]).optional(),
});

export const borrowToolSchema = z.object({
  id: z.string(),
  borrowDate: z.string().datetime(),
  expectedReturnDate: z.string().datetime(),
});

export const returnToolSchema = z.object({
  id: z.string(),
  borrowerID: z.string(),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
});
