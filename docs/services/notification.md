# Notification Service

The notification service handles all notification-related operations in the application, including creation, retrieval, and management of user notifications.

## Methods

### createNotification

Creates a new notification.

**Parameters:**

- `input`: Notification creation data that follows the `notificationCreateSchema`:
  - `userId`: string (user ID)
  - `title`: string (1-200 chars)
  - `message`: string (1-1000 chars)
  - `type`: "system" | "task" | "marketplace" | "points" | "badges" | "membership" | "misc"
  - `link`: string (optional, valid URL)
  - `expiresAt`: Date (optional)

**Returns:** Promise<INotification>

**Usage Example:**
```typescript
const notification = await NotificationService.createNotification({
  userId: "user123",
  title: "New Task Assigned",
  message: "You have been assigned a new gardening task",
  type: "task",
  link: "/tasks/123",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
});
```

### getNotificationById

Retrieves a single notification by its ID.

**Parameters:**

- `id`: string (notification ID)

**Returns:** Promise<INotification | null>

- Returns null if notification not found

**Usage Example:**
```typescript
const notification = await NotificationService.getNotificationById("notification123");
if (notification) {
  console.log(notification.title);
}
```

### getNotifications

Retrieves multiple notifications with filtering and pagination.

**Parameters:**

- `options`: GetNotificationsOptions (optional)
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `type`: NotificationType (optional)
  - `status`: "unread" | "read" (optional)

**Returns:** Promise<PaginatedNotifications>

- Returns paginated response containing:
  - `data`: Array of notifications
  - `pagination`: Object containing:
    - `total`: Total number of notifications matching query
    - `page`: Current page number
    - `limit`: Number of items per page
    - `pages`: Total number of pages

**Usage Example:**
```typescript
const { data, pagination } = await NotificationService.getNotifications({
  type: "marketplace",
  status: "unread",
  page: 1,
  limit: 20
});
```

### getUserNotifications

Retrieves notifications for a specific user with filtering and pagination.

**Parameters:**

- `userId`: string (user ID)
- `options`: GetNotificationsOptions (optional)
  - Same options as getNotifications

**Returns:** Promise<PaginatedNotifications>

**Usage Example:**
```typescript
const { data, pagination } = await NotificationService.getUserNotifications(
  "user123",
  {
    status: "unread",
    limit: 10
  }
);
```

### updateNotification

Updates an existing notification.

**Parameters:**

- `id`: string (notification ID)
- `updates`: Partial notification update data following `notificationUpdateSchema`
  - All fields from createNotification are optional

**Returns:** Promise<INotification | null>

- Returns null if notification not found

**Usage Example:**
```typescript
const updatedNotification = await NotificationService.updateNotification(
  "notification123",
  {
    title: "Updated Task Title",
    message: "Updated task description"
  }
);
```

### markAsRead

Marks a notification as read and sets the readAt timestamp.

**Parameters:**

- `id`: string (notification ID)

**Returns:** Promise<INotification | null>

- Returns null if notification not found

**Usage Example:**
```typescript
const readNotification = await NotificationService.markAsRead("notification123");
if (readNotification) {
  console.log("Notification marked as read");
}
```

### deleteNotification

Deletes a notification.

**Parameters:**

- `id`: string (notification ID)

**Returns:** Promise<boolean>

- Returns true if notification was deleted, false if not found

**Usage Example:**
```typescript
const deleted = await NotificationService.deleteNotification("notification123");
if (deleted) {
  console.log("Notification successfully deleted");
}
```

### deleteExpiredNotifications

Deletes all notifications that have passed their expiration date.

**Parameters:** None

**Returns:** Promise<number>

- Returns the number of notifications deleted

**Usage Example:**
```typescript
const deletedCount = await NotificationService.deleteExpiredNotifications();
console.log(`Deleted ${deletedCount} expired notifications`);
```

## Database Schema

The Notification model includes:
- `userId`: ObjectId (reference to User)
- `title`: String (required)
- `message`: String (required)
- `type`: String (enum: system, task, marketplace, points, badges, membership, misc)
- `status`: String (enum: unread, read)
- `link`: String (optional)
- `expiresAt`: Date (optional)
- `readAt`: Date (optional)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## Integration Examples

### Marketplace Integration
```typescript
// Create notifications for marketplace transactions
await Promise.all([
  NotificationService.createNotification({
    userId: sellerId,
    type: "marketplace",
    title: "Listing Purchased",
    message: `Your listing "${listing.name}" has been purchased for ${listing.price} points.`,
    link: `/marketplace/item/${listing.id}`,
  }),
  NotificationService.createNotification({
    userId: buyerId,
    type: "marketplace",
    title: "Purchase Successful",
    message: `You have successfully purchased "${listing.name}" for ${listing.price} points.`,
    link: `/marketplace/item/${listing.id}`,
  })
]);
``` 