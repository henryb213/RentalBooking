# Theme System Documentation

## Overview
This application uses `next-themes` for theme management, supporting light, dark, and system theme preferences. The theme system is configured to work with CSS variables and Tailwind CSS.

## Configuration
The theme configuration consists of:
1. Theme Provider setup in `src/providers/index.tsx`
2. CSS variables defined in `src/styles/themes/light.css` and `src/styles/themes/dark.css`
3. Tailwind configuration in `tailwind.config.ts`

## Usage

### Theme Selection Component
The application includes a pre-built ThemeSelector component that provides a dropdown interface for theme selection.

```typescript
import ThemeSelector from "@/components/settings/ThemeSelector";

export function YourComponent() {
  return (
    <div>
      <ThemeSelector />
    </div>
  );
}
```

### Using Theme Hooks
To access and modify the theme in your components, use the `useTheme` hook from next-themes.

```typescript
import { useTheme } from "next-themes";

export function ThemeToggleExample() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
      <button onClick={() => setTheme("light")}>Light Mode</button>
      <button onClick={() => setTheme("system")}>System</button>
    </div>
  );
}
```

### Handling Theme Hydration
To prevent hydration mismatch errors, you should check if the component is mounted before rendering theme-dependent content. This is particularly important when using the theme value directly in your component's render output.

```typescript
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeAwareComponent() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or loading state
  }

  return (
    <div>
      The current theme is: {theme}
    </div>
  );
}
```

### Available Themes
The application supports the following themes:
- `light`: Light theme
- `dark`: Dark theme
- `system`: Automatically matches system preferences

### CSS Variables
Theme-specific styles are defined using CSS variables. Access these in your components using Tailwind's variable system:

Key variables include:
- `--background`: Page background color
- `--card-background`: Card and component background color
- `--primary`: Primary action color
- `--secondary`: Secondary action color
- `--accent`: Accent color for highlights
- `--destructive`: Error and destructive action color
- `--foreground`: Text colors for each variant

### Theme-Aware Components
When creating components that need to be theme-aware:
1. Use the provided CSS variables through Tailwind classes
2. Utilize the `cn()` utility for class name merging
3. Consider hydration safety when displaying theme values

```typescript
import { cn } from "@/lib/utils";

interface ThemeAwareButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function ThemeAwareButton({ className, children }: ThemeAwareButtonProps) {
  return (
    <button 
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
    >
      {children}
    </button>
  );
}
```

### Best Practices
1. Always handle hydration with mounted checks when displaying theme values
2. Use CSS variables through Tailwind classes instead of direct CSS
3. Provide fallback UI for pre-hydration render
4. Test components in all theme modes
5. Consider system theme preferences as the default