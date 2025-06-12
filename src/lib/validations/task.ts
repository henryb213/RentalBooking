import { z } from "zod";
import { paginationSchema } from "@/lib/validations/api";
import mongoose from "mongoose";

export const getAllSchema = z.object({
  ...paginationSchema.shape,
  status: z.enum(["open", "inProgress", "completed"]).optional(),
  category: z.string().optional(),
  assignedTo: z
    .string()
    .optional()
    .refine(
      (assignedTo) =>
        !assignedTo || mongoose.Types.ObjectId.isValid(assignedTo),
      {
        message: "Invalid ObjectId for assignedTo",
      },
    ),
});

export const getByIDSchema = z.object({
  id: z.string(),
});

export const createSchema = z.object({
  taskBoardId: z
    .string()
    .refine((taskBoardId) => mongoose.Types.ObjectId.isValid(taskBoardId), {
      message: "Invalid ObjectId",
    }),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "inProgress", "completed"]),
  createdBy: z
    .string()
    .refine((createdBy) => mongoose.Types.ObjectId.isValid(createdBy), {
      message: "Invalid ObjectId",
    }),
  dueDate: z.string().datetime().optional(),
  plotId: z.string(),
});

export const updateSchema = z.object({
  id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  }),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.date().optional(),
});

export const deleteSchema = z.object({
  _id: z.string().refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: "Invalid ObjectId",
  }),
});

export const toggleStatusSchema = z.object({
  _id: z.string().refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: "Invalid ObjectId",
  }),
});

export const toggleImportanceSchema = z.object({
  _id: z.string().refine((_id) => mongoose.Types.ObjectId.isValid(_id), {
    message: "Invalid ObjectId",
  }),
});

export const getNumberOfTasksSchema = z.object({
  id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId",
  }),
  status: z.enum(["open", "inProgress", "completed"]).optional(),
  overdue: z.boolean().optional(), // Overdue if current date is past the tasks due date.
  createdInLast: z
    .enum(["All Time", "1 Month", "1 Week", "24 Hours"])
    .optional(), // How far back through the dates we should go, if omitted show all.
});
