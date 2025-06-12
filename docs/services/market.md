# Marketplace Service

The marketplace service should be used on the backend for interacting with marketplace logic.

## Methods

### createListing

Creates a new marketplace listing.

**Parameters:**

- `input`: Listing creation data that follows the `listingCreateSchema`:
  - `name`: string (2-100 chars)
  - `price`: number (min 0)
  - `quantity`: number (min 1, optional, defaults to 1)
  - `category`: string
  - `imageUrls`: string[] (optional)
  - `description`: string
  - `pickupmethod`: "myloc" | "post"
  - `createdBy`: string (user ID)

**Returns:** Promise<IListing>

**Usage Example:**

```typescript
const newListing = await MarketService.createListing({
  name: "Vintage Camera",
  price: 100,
  category: "Electronics",
  description: "Classic film camera in excellent condition",
  pickupmethod: "myloc",
  createdBy: "user123",
  imageUrls: ["https://example.com/camera1.jpg"],
});
```

### getListingById

Retrieves a single listing by its ID.

**Parameters:**

- `id`: string (listing ID)

**Returns:** Promise<PopulatedListing | null>

- Returns null if listing not found
- Populated listing includes creator and purchaser user details (excluding password hashes)

**Usage Example:**

```typescript
const listing = await MarketService.getListingById("listing123");
if (listing) {
  console.log(listing.name, listing.createdBy.username);
}
```

### getListings

Retrieves multiple listings with filtering and pagination.

**Parameters:**

- `options`: GetListingsOptions (optional)
  - `status`: "open" | "closed"
  - `category`: string
  - `createdById`: string
  - `purchasedById`: string
  - `sort`: "price:asc" | "price:desc" | "createdAt:asc" | "createdAt:desc" | "status:open"
- `pagination`: PaginationOptions (optional)
  - `page`: number (default: 1)
  - `limit`: number (default: 10)

**Returns:** Promise<PaginatedResponse<PopulatedListing>>

- Returns paginated response containing:
  - `data`: Array of populated listings with creator and purchaser details
  - `pagination`: Object containing:
    - `total`: Total number of listings matching query
    - `page`: Current page number
    - `limit`: Number of items per page
    - `pages`: Total number of pages

**Usage Example:**

```typescript
const { data, pagination } = await MarketService.getListings(
  {
    status: "open",
    category: "Electronics",
    sort: "price:asc",
  },
  {
    page: 1,
    limit: 20,
  },
);
console.log(`Found ${pagination.total} listings`);
```

### updateListing

Updates an existing listing.

**Parameters:**

- `id`: string (listing ID)
- `updates`: Partial listing update data following `listingUpdateSchema`
  - All fields from createListing are optional
  - Can update status to "closed"

**Returns:** Promise<IListing | null>

- Returns null if listing not found

**Usage Example:**

```typescript
const updatedListing = await MarketService.updateListing("listing123", {
  price: 90,
  description: "Price reduced! Classic film camera in excellent condition",
});
```

### deleteListing

Deletes a listing.

**Parameters:**

- `id`: string (listing ID)

**Returns:** Promise<boolean>

- Returns true if listing was deleted, false if not found

**Usage Example:**

```typescript
const deleted = await MarketService.deleteListing("listing123");
if (deleted) {
  console.log("Listing successfully removed");
}
```

### searchListings

Searches listings by text query.

**Parameters:**

- `query`: string (search text)
- `options`: (optional)
  - `limit`: number (default: 10)
  - `status`: "open" | "closed"
  - `category`: string

**Returns:** Promise<IListing[]>

- Searches name, description and category fields
- Case insensitive search

**Usage Example:**

```typescript
const searchResults = await MarketService.searchListings("camera", {
  limit: 5,
  status: "open",
  category: "Electronics",
});
```

### purchaseListing

Handles the purchase transaction for a listing.

**Parameters:**

- `id`: string (listing ID)
- `userId`: string (purchasing user's ID)

**Returns:** Promise<{ success: boolean; error?: string }>

**Process:**

1. Validates listing exists and is available
2. Checks buyer has sufficient points
3. Handles points transfer between buyer and seller
4. Updates listing status to closed
5. Includes rollback on failure

**Error cases:**

- Listing not found
- Already purchased
- Self-purchase attempt
- Insufficient funds
- Transaction failures

**Usage Example:**

```typescript
const purchase = await MarketService.purchaseListing("listing123", "buyer456");
if (purchase.success) {
  console.log("Purchase successful!");
} else {
  console.error("Purchase failed:", purchase.error);
}
```
