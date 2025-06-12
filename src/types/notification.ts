import { Document, Model, Types } from "mongoose";

export type NotificationType =
  | "system"
  | "task"
  | "marketplace"
  | "points"
  | "badges"
  | "membership"
  | "misc";

export type NotificationStatus = "unread" | "read";

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  link?: string;
  // metadata?:  // Maybe add later
  expiresAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationD extends INotification, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface INotificationM extends Model<INotificationD> {}

export type GetNotificationsOptions = {
  page?: number;
  limit?: number;
  type?: NotificationType;
  status?: NotificationStatus;
};

export type PaginatedNotifications = {
  data: INotification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};
