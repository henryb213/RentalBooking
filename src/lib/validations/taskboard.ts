import { z } from "zod";
import { paginationSchema } from "@/lib/validations/api";
import mongoose from "mongoose";

export const getMostRecentSchema = z.object({
  owner: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  }),
  path: z.string(),
});

export const getAllTaskboardSchema = z.object({
  ...paginationSchema.shape,
  owner: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  }),
  path: z.string(),
});

export const updateTaskboardSchema = z.object({
  _id: z.string().refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: "Invalid ObjectId",
  }),
  path: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  plot: z.string().optional(),
  listed: z.boolean().optional(),
});

export const createTaskboardSchema = z.object({
  owner: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  }),
  path: z.string(),
  title: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  plot: z.string().optional(),
});

export const deleteTaskboardSchema = z.object({
  _id: z.string().refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: "Invalid ObjectId",
  }),
  flag: z.boolean().optional(),
});
