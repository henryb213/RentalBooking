import { z } from "zod";
import { paginationSchema } from "./api";

export const notificationCreateSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum([
    "system",
    "task",
    "marketplace",
    "points",
    "badges",
    "membership",
    "misc",
  ]),
  link: z.string().url().optional(),
  expiresAt: z.date().optional(),
});

export const notificationUpdateSchema = notificationCreateSchema
  .extend({
    status: z.enum(["unread", "read"]),
    readAt: z.date(),
  })
  .partial();

export const getNotificationsSchema = z.object({
  ...paginationSchema.shape,
  type: z
    .enum([
      "system",
      "task",
      "marketplace",
      "points",
      "badges",
      "membership",
      "misc",
    ])
    .optional(),
  status: z.enum(["unread", "read"]).optional(),
});
