# Notification Provider

The notification provider is a React context provider that manages notification state and provides real-time notification updates to the application.

## Overview

The notification provider:
- Manages the unread notification count
- Provides real-time updates through polling
- Integrates with the authentication system
- Provides a hook for easy access to notification state

## Usage

### Provider Setup

Wrap your application with the NotificationProvider:

```typescript
import { NotificationProvider } from "@/providers/notification";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}
```

### Using the Hook

Use the `useNotification` hook to access notification state and functions:

```typescript
import { useNotification } from "@/providers/notification";

function NotificationComponent() {
  const { count, setCount, poll } = useNotification();

  return (
    <div>
      {count !== undefined && (
        <span>You have {count} unread notifications</span>
      )}
    </div>
  );
}
```

## API

### NotificationContext

The context provides the following properties:

- `count`: number | undefined
  - The current number of unread notifications
  - undefined when not yet loaded
- `setCount`: (count: number) => void
  - Function to manually update the notification count
- `poll`: () => void
  - Function to manually trigger a notification count refresh

### useNotification Hook

The hook provides access to the notification context:

```typescript
const { count, setCount, poll } = useNotification();
```

**Returns:**
- `count`: The current number of unread notifications
- `setCount`: Function to update the notification count
- `poll`: Function to refresh the notification count

**Throws:**
- Error if used outside of NotificationProvider

## Integration Examples

### Manual Polling
```typescript
function NotificationManager() {
  const { poll } = useNotification();

  useEffect(() => {
    // Poll every 30 seconds
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [poll]);

  return null;
}
```

## Best Practices

1. Always use the `useNotification` hook within components wrapped by NotificationProvider
2. Use the `poll` function sparingly to avoid unnecessary API calls
3. Consider implementing debouncing for manual polling
4. Handle the undefined state of count appropriately in your UI
5. Use the provider at a high level in your component tree to ensure all child components have access to notification state

## Error Handling

The provider includes built-in error handling:
- Throws an error if used outside of NotificationProvider
- Handles authentication state changes automatically
- Manages API query states appropriately

## Performance Considerations

- The provider uses React's Context API for efficient state management
- Polling is only enabled when the user is authenticated
- The notification count is cached and only updated when necessary
- The provider automatically cleans up subscriptions and intervals 