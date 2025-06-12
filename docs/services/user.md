# User Service

The user service should be used on the backend for managing user accounts and related operations.

## Methods

### createUser

Creates a new user account.

**Parameters:**

- `input`: User creation data that follows the `userCreateSchema`:
  - `email`: string (valid email)
  - `password`: string (8-100 chars)
  - `firstName`: string (2-50 chars)
  - `lastName`: string (2-50 chars)
  - `role`: "admin" | "plotOwner" | "communityMember" (optional, defaults to "communityMember")
  - `points`: number (optional, defaults to 100)
  - `profile`: (optional)
    - `bio`: string (max 500 chars)
    - `skills`: string[]
    - `interests`: string[]
  - `address`: (optional)
    - `street`: string
    - `city`: string
    - `region`: string
    - `postCode`: string

**Returns:** Promise<Omit<IUser, "passwordHash">>

**Usage Example:**
```typescript
const newUser = await UserService.createUser({
  email: "jane.doe@example.com",
  password: "securepass123",
  firstName: "Jane",
  lastName: "Doe",
  role: "plotOwner",
  profile: {
    bio: "Passionate about urban gardening",
    skills: ["composting", "organic farming"],
    interests: ["sustainability", "community building"]
  },
  address: {
    street: "123 Garden Street",
    city: "Greenville",
    region: "West",
    postCode: "G12 3AB"
  }
});
```

### getUserById

Retrieves a single user by their ID.

**Parameters:**

- `id`: string (user ID)
- `excludePassword`: boolean (optional, default: true)

**Returns:** Promise<IUser | Omit<IUser, "passwordHash"> | null>

- Returns null if user not found
- When excludePassword is true, passwordHash is removed from the response

**Usage Example:**
```typescript
const user = await UserService.getUserById("user123");
if (user) {
  console.log(`${user.firstName} ${user.lastName}`);
}
```

### getUserByEmail

Retrieves a single user by their email address.

**Parameters:**

- `email`: string
- `excludePassword`: boolean (optional, default: true)

**Returns:** Promise<IUser | Omit<IUser, "passwordHash"> | null>

- Returns null if user not found
- When excludePassword is true, passwordHash is removed from the response

**Usage Example:**
```typescript
const userByEmail = await UserService.getUserByEmail("jane.doe@example.com");
if (!userByEmail) {
  console.log("User not found");
}
```

### getUsers

Retrieves multiple users with filtering and pagination.

**Parameters:**

- `options`: GetUsersOptions (optional)
  - `role`: "admin" | "plotOwner" | "communityMember"
  - `page`: number (default: 1)
  - `limit`: number (default: 10)

**Returns:** Promise<PaginatedResponse<IUser>>

- Returns paginated response containing:
  - `data`: Array of users (excluding password hashes)
  - `pagination`: Object containing:
    - `total`: Total number of users matching query
    - `page`: Current page number
    - `limit`: Number of items per page
    - `pages`: Total number of pages

**Usage Example:**
```typescript
const { data, pagination } = await UserService.getUsers({
  role: "plotOwner",
  page: 1,
  limit: 20
});
console.log(`Found ${pagination.total} plot owners`);
```

### updateUser

Updates an existing user's information.

**Parameters:**

- `id`: string (user ID)
- `updates`: Partial user update data following `userUpdateSchema`
  - All fields from createUser are optional
  - Email updates check for uniqueness

**Returns:** Promise<Omit<IUser, "passwordHash"> | null>

- Returns null if user not found

**Usage Example:**
```typescript
const updatedUser = await UserService.updateUser("user123", {
  profile: {
    bio: "Updated bio with new interests",
    skills: ["composting", "organic farming", "permaculture"],
    interests: ["sustainability", "community building", "education"]
  },
  points: 150,
  address: {
    city: "New City"
  }
});
```

### deleteUser

Deletes a user account.

**Parameters:**

- `id`: string (user ID)

**Returns:** Promise<boolean>

- Returns true if user was deleted, false if not found

**Usage Example:**
```typescript
const deleted = await UserService.deleteUser("user123");
if (deleted) {
  console.log("User account successfully removed");
}
```

### searchUsers

Searches users by text query.

**Parameters:**

- `query`: string (search text)
- `options`: (optional)
  - `limit`: number (default: 10)
  - `role`: "admin" | "plotOwner" | "communityMember"

**Returns:** Promise<IUser[]>

- Searches firstName, lastName, and email fields
- Case insensitive search
- Excludes password hashes from results

**Usage Example:**
```typescript
const searchResults = await UserService.searchUsers("jane", {
  limit: 5,
  role: "plotOwner"
});
```
