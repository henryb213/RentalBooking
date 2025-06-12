# Authentication Documentation

## Overview
This application uses NextAuth.js for authentication with a JWT-based session strategy and MongoDB as the adapter. Authentication is currently only implemented with email/password (credentials) provider.

## Configuration
The authentication configuration is defined in `auth.config.ts` which includes:

## Frontend Usage

### Protected Client Components
For client components that require authentication:
1. Use the `useSession` hook from `next-auth/react`
2. Implement redirect logic for unauthenticated users
3. Access session data including user information

**Example:**
```typescript
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProtectedClientComponent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome {session.user.firstName}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Protected Server Components
For server components that require authentication:
1. Import the `auth` helper from `@/auth`
2. Use `await auth()` to get session data
3. Implement redirect logic using Next.js `redirect`

**Example:**
```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedServerComponent() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome {session.user.firstName}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Protected Routes
To protect entire routes:
1. Create a layout.tsx file in the route directory
2. Use the `auth` helper to check authentication
3. Implement redirect logic

**Example:**
```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return children;
}
```

### Sign In Component
The application provides a compound SignIn component with:
- Form handling
- Validation
- Error management
- Success callbacks
- Custom styling support

**Example:**
```typescript
import { SignIn } from "@/components/auth/sign-in";

export default function LoginPage() {
  return (
    <SignIn.Provider
      onSuccess={() => console.log("Signed in successfully")}
      onError={(error) => console.error(error)}
      redirectTo="/dashboard"
    >
      <SignIn.Form>
        <SignIn.Error />
        <SignIn.EmailField />
        <SignIn.PasswordField />
        <SignIn.SubmitButton>Sign In</SignIn.SubmitButton>
      </SignIn.Form>
    </SignIn.Provider>
  );
}
```

### Sign Out
The application provides two methods for signing out:
1. Client-side using SignOutButton component
2. Server-side using the signOut action

**Example:**
```typescript
// Client-side
import SignOutButton from "@/components/auth/signout-button";

export function SignOutExample() {
  return (
    <SignOutButton 
      onSuccess={() => console.log("Signed out")}
    >
      Sign Out
    </SignOutButton>
  );
}

// Server-side
import { signOut } from "@/auth";

export async function handleSignOut() {
  "use server";
  await signOut({ redirect: true, redirectTo: "/" });
}
```

## Backend Usage

### Protected API Routes
For API routes requiring authentication:
1. Import the `auth` helper
2. Check session existence
3. Implement role-based access if needed

**Example:**
```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 }
    );
  }

  if (session.user.role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403 }
    );
  }

  // Protected route logic here
  return NextResponse.json({ data: "Protected data" });
}
```

### User Service Integration
The UserService provides methods for:
- User creation
- Profile management
- Password handling
- Role management

**Example:**
```typescript
import { UserService } from "@/server/services/user.service";

// Create user
const newUser = await UserService.createUser({
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  role: "communityMember",
  profile: {
    bio: "Garden enthusiast",
    skills: ["composting", "organic farming"],
    interests: ["sustainability"]
  }
});
```

### Database Schema
The User model includes:
- Authentication fields (email, passwordHash)
- Profile information
- Role management
- Points system
- Address information

## Role-Based Access Control
The system supports three user roles:
- admin
- plotOwner
- communityMember

Each role can have different access levels and permissions throughout the application.

## Security Considerations
1. Passwords are hashed using bcrypt
2. JWT tokens are used for session management
3. MongoDB adapter ensures secure session storage
4. Form validation prevents common security issues
5. CSRF protection is enabled by default

## Error Handling
The system includes custom error classes:
- FormValidationError for input validation
- AuthenticationError for auth-related issues

Implement proper error handling in both client and server components.

## Best Practices
1. Always check authentication status before rendering protected content
2. Use server-side authentication checks for sensitive operations
3. Implement proper error handling and user feedback
4. Keep session tokens secure
5. Use type-safe authentication helpers
6. Implement proper loading states during authentication
7. Handle session expiration gracefully

## Related Components
- SignIn component
- SignUp component
- SignOutButton
- AuthProvider
- Protected layouts
- User profile components