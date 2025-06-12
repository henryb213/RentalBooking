import { connectDB } from "@/lib/mongo";
import { Notification } from "@/lib/models";
import { z } from "zod";
import {
  INotification,
  INotificationD,
  GetNotificationsOptions,
  PaginatedNotifications,
} from "@/types/notification";
import {
  notificationCreateSchema,
  notificationUpdateSchema,
} from "@/lib/validations/notification.schema";

export class NotificationService {
  static async createNotification(
    input: z.infer<typeof notificationCreateSchema>,
  ): Promise<INotification> {
    await connectDB();

    const notification = await Notification.create<INotificationD>(input);
    return notification.toObject();
  }

  static async getNotificationById(id: string): Promise<INotification | null> {
    await connectDB();

    const notification = await Notification.findById<INotificationD>(id).exec();
    return notification ? notification.toObject() : null;
  }

  static async getNotifications(
    options: GetNotificationsOptions = {},
  ): Promise<PaginatedNotifications> {
    await connectDB();

    const { page = 1, limit = 10, type, status } = options;
    const query: Record<string, unknown> = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<INotification[]>(),
      Notification.countDocuments(query).exec(),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserNotifications(
    userId: string,
    options: GetNotificationsOptions = {},
  ): Promise<PaginatedNotifications> {
    await connectDB();

    const { page = 1, limit = 10, type, status } = options;
    const query: Record<string, unknown> = { userId };

    if (type) query.type = type;
    if (status) query.status = status;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<INotification[]>(),
      Notification.countDocuments(query).exec(),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateNotification(
    id: string,
    updates: z.infer<typeof notificationUpdateSchema>,
  ): Promise<INotification | null> {
    await connectDB();

    const notification = await Notification.findByIdAndUpdate<INotificationD>(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).exec();

    return notification ? notification.toObject() : null;
  }

  static async markAsRead(id: string): Promise<INotification | null> {
    await connectDB();

    const notification = await Notification.findByIdAndUpdate<INotificationD>(
      id,
      {
        $set: {
          status: "read",
          readAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();

    return notification ? notification.toObject() : null;
  }

  static async deleteNotification(id: string): Promise<boolean> {
    await connectDB();

    const result = await Notification.findByIdAndDelete(id).exec();
    return result !== null;
  }

  static async deleteExpiredNotifications(): Promise<number> {
    await connectDB();

    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();

    return result.deletedCount;
  }
}
