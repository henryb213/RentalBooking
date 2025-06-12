import { z } from "zod";
import mongoose from "mongoose";

export const createBookingSchema = z.object({
  startDate: z.date().refine((date: Date) => date > new Date(), {
    message: "Start date must be in the future",
  }),
  endDate: z.date(),
  guests: z.number().min(1, "At least one guest is required"),
  totalPrice: z.number().min(0, "Total price must be a positive number"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
});

export const updateBookingSchema = z.object({
  id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid booking ID",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  guests: z.number().min(1, "At least one guest is required").optional(),
  totalPrice: z.number().min(0, "Total price must be a positive number").optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.endDate && data.startDate && data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
    });
    }
    if (data.startDate && data.startDate <= new Date()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date must be in the future",
        });
    }
});

export const getBookingByIdSchema = z.object({
    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid booking ID",
    }),
});

export const deleteBookingSchema = z.object({
    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid booking ID",
    }),
});