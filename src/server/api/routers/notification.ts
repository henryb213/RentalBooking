import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { NotificationService } from "@/server/services/notification.service";
import { TRPCError } from "@trpc/server";
import {
  notificationCreateSchema,
  notificationUpdateSchema,
  getNotificationsSchema,
} from "@/lib/validations/notification.schema";

export const notificationRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(getNotificationsSchema)
    .query(async ({ input }) => {
      const notifications = await NotificationService.getNotifications({
        page: input.page,
        limit: input.limit,
        type: input.type,
        status: input.status,
      });
      return notifications;
    }),

  getUserNotifications: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        ...getNotificationsSchema.shape,
      }),
    )
    .query(async ({ input }) => {
      const { userId, ...options } = input;
      const notifications = await NotificationService.getUserNotifications(
        userId,
        options,
      );
      return notifications;
    }),

  create: publicProcedure
    .input(notificationCreateSchema)
    .mutation(async ({ input }) => {
      const notification = await NotificationService.createNotification(input);
      if (!notification) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return notification;
    }),

  markAsRead: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const notification = await NotificationService.markAsRead(input.id);
      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return notification;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        ...notificationUpdateSchema.shape,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const notification = await NotificationService.updateNotification(
        id,
        updates,
      );
      if (!notification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return notification;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const success = await NotificationService.deleteNotification(input.id);
      if (!success) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { success };
    }),

  cleanupExpired: publicProcedure.mutation(async () => {
    const deletedCount = await NotificationService.deleteExpiredNotifications();
    return { deletedCount };
  }),
});
