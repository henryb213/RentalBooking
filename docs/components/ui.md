# Base UI Components

## Button

Example usage:

```typescript
import Button from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline"; // Example icon

export default function ButtonExamples() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Basic usage */}
      <Button>Default Button</Button>

      {/* Different variants */}
      <div className="flex gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link Style</Button>
      </div>

      {/* Different sizes */}
      <div className="flex items-center gap-2">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>

      {/* Loading state */}
      <Button loading>Loading Button</Button>

      {/* Disabled state */}
      <Button disabled>Disabled Button</Button>

      {/* With link/href */}
      <Button href="/dashboard">Navigate to Dashboard</Button>

      {/* With icon and text */}
      <Button>
        Next Step <ArrowRightIcon className="ml-2 h-4 w-4" />
      </Button>

      {/* Combining multiple props */}
      <Button
        variant="primary"
        size="lg"
        loading={false}
        onClick={() => console.log("clicked")}
        className="w-full"
      >
        Submit Form
      </Button>
    </div>
  );
}
```

## Alert

Example usage:

```typescript
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Alert from '@/components/ui/alert';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <Alert
      open={open}
      onClose={setOpen}
      title="Deactivate account"
      icon={ExclamationTriangleIcon}
      variant="destructive"
      onSubmit={() => console.log('Confirmed')}
      onCancel={() => console.log('Cancelled')}
      submitText="Deactivate"
    >
      <p className="text-sm text-gray-500">
        Are you sure you want to deactivate your account? All of your data will be permanently
        removed from our servers forever. This action cannot be undone.
      </p>
    </Alert>
  );
}
```
