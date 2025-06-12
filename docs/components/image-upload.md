# Image Uploader Generic Component

This componet provides a flexible, composable interface for handling image uploads and returning the reference url. This url should then be passed as form data to your desired API (for example, marketplace listing creation).

## Component Structure

### Provider
`ImageUpload.Provider`
- Must wrap all other image upload components
- Manages upload state and logic
- Provides success/error callbacks
- Required for all image upload functionality

### Core Components
- `ImageUpload.Uploader`: Container component that prevents form conflicts
- `ImageUpload.UploadButton`: Trigger for file selection dialog
- `ImageUpload.Preview`: Displays uploaded image
- `ImageUpload.Placeholder`: Shows content when no image is selected
- `ImageUpload.Error`: Displays error messages

### Hook
`useImageUpload()`
- Provides access to upload state
- Must be used within Provider
- Returns:
  - `status`: 'idle' | 'pending' | 'success' | 'error'
  - `error`: string | undefined
  - `isLoading`: boolean dependent on status
  - `imageUrl`: string | undefined
  - `handleFileSelect`: (file: File) => Promise<void>

## Usage Notes
1. Always place Provider at the top level of your image upload implementation
2. Use Uploader component when inside forms to prevent submission conflicts
3. Hook must only be used in components beneath the Provider
4. All components accept standard HTML attributes for styling
5. Provider callbacks can be used to integrate with parent component state

## Example Implementation

```typescript
"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { useState } from "react";
import { useImageUpload } from "@/components/ui/image-upload";

// Example form data type
type FormData = {
  title: string;
  description: string;
  imageUrl?: string;
};

// Component to handle form submission using the image URL
const FormWithImage = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    // Your form submission logic here
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold">Create Item</h1>

      {/* ImageUpload.Provider must wrap any components that need access to upload state */}
      <ImageUpload.Provider
        onSuccess={(url) => {
          // Update form data when image upload succeeds
          setFormData((prev) => ({ ...prev, imageUrl: url }));
        }}
        onError={(error) => {
          console.error("Image upload failed:", error);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Regular form fields */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border p-2"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-md border p-2"
              required
            />
          </div>

          {/* Image upload section - Note the separate form to prevent conflicts */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <ImageUpload.Uploader className="rounded-md border p-4">
              <div className="space-y-4">
                <ImageUpload.UploadButton className="inline-block cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Choose Image
                </ImageUpload.UploadButton>

                <ImageUpload.Error className="text-sm text-red-500" />

                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <ImageUpload.Preview className="absolute inset-0 h-full w-full object-contain" />
                  <ImageUpload.Placeholder className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-500">
                    No image selected
                  </ImageUpload.Placeholder>
                </div>
              </div>
            </ImageUpload.Uploader>
          </div>

          {/* Submit button with upload status awareness */}
          <SubmitButton />
        </form>
      </ImageUpload.Provider>
    </div>
  );
};

// Separate component to demonstrate useImageUpload hook usage
const SubmitButton = () => {
  // Access upload state using the hook
  const { isLoading, imageUrl, status } = useImageUpload();

  return (
    <button
      type="submit"
      disabled={isLoading}
    >
      {isLoading
        ? "Uploading Image..."
        : status === "success"
        ? "Submit Form"
        : "Please Upload an Image"}
    </button>
  );
};

export default FormWithImage;
```

### Key Notes about Implementation

1. *Provider Placement:*
```typescript
   <ImageUpload.Provider onSuccess={...} onError={...}>
     <form>
       {/* All components that need access to upload state go here */}
     </form>
   </ImageUpload.Provider>
```

2. *Form Data Management:*
```typescript
   const [formData, setFormData] = useState<FormData>({
     title: "",
     description: "",
   });

   // Update form data when image uploads
   onSuccess={(url) => {
     setFormData(prev => ({ ...prev, imageUrl: url }));
   }}
```

3. *Separate Upload Form:*

You must wrap your image uploading in a dummy form to prevent it interacting with the parent form.

```typescript
   <ImageUpload.Uploader className="...">
     {/* Upload components go here */}
   </ImageUpload.Uploader>
```

4. *Hook Usage:*
```typescript
    const { isLoading, imageUrl, status } = useImageUpload();
    // Use these values to control state
```

5. *Error Handling:*
```typescript
   <ImageUpload.Error className="text-sm text-red-500" />
```

6. *Preview/Placeholder:*
```typescript
   <div className="relative ...">
     <ImageUpload.Preview className="..." />
     <ImageUpload.Placeholder className="...">
       No image selected
     </ImageUpload.Placeholder>
   </div>
```

## Best Practices
1. Handle both success and error states in Provider callbacks
2. Provide clear feedback during upload process
3. Implement appropriate validation for your use case
4. Consider accessibility in custom implementations
5. Handle loading states appropriately