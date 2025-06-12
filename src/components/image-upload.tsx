"use client";

import { api } from "@/trpc/react";
import { createContext, useContext, useState } from "react";

class ImageUploadError {
  name: string;
  message: string;

  constructor(message: string) {
    this.message = message;
    this.name = "ImageUploadError";
  }
}

// Types
type UploadStatus = "idle" | "pending" | "success" | "error";

type ImageUploadContextType = {
  status: UploadStatus;
  error: string | undefined;
  isLoading: boolean;
  imageUrl: string | undefined;
  handleFileSelect: (file: File) => Promise<void>;
};

type ImageUploadProviderProps = {
  children: React.ReactNode;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
};

// Context
const ImageUploadContext = createContext<ImageUploadContextType | undefined>(
  undefined,
);

// Provider Component
const ImageUploadProvider = ({
  children,
  onSuccess,
  onError,
}: ImageUploadProviderProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string>();

  const getSignedUrl = api.image.getImageUploadUrl.useMutation({
    onError: (err) => {
      setStatus("error");
      setError(err.message);
      onError?.(err.message);
    },
  });

  const handleFileSelect = async (file: File) => {
    try {
      setStatus("pending");
      setError(undefined);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new ImageUploadError("Selected file must be an image");
      }

      // Get signed URL
      const { signedUrl, imageUrl } = await getSignedUrl.mutateAsync({
        fileName: file.name,
        fileType: file.type,
      });

      // Upload to S3
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new ImageUploadError("Failed to upload image");
      }

      setImageUrl(imageUrl);
      setStatus("success");
      onSuccess?.(imageUrl);
    } catch (err) {
      setStatus("error");
      const message =
        err instanceof ImageUploadError
          ? err.message
          : "Failed to upload image";
      setError(message);
      onError?.(message);
    }
  };

  const value = {
    status,
    error,
    isLoading: status === "pending",
    imageUrl,
    handleFileSelect,
  };

  return (
    <ImageUploadContext.Provider value={value}>
      {children}
    </ImageUploadContext.Provider>
  );
};

// Custom hook
const useImageUpload = () => {
  const context = useContext(ImageUploadContext);
  if (!context) {
    throw new ImageUploadError(
      "useImageUpload must be used within ImageUploadProvider",
    );
  }
  return context;
};

// Compound Components
const Uploader = ({
  children,
  className = "",
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
  };

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {children}
    </form>
  );
};

const UploadButton = ({
  className = "",
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  const { handleFileSelect, isLoading } = useImageUpload();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <label className={className} {...props}>
      <input
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
        disabled={isLoading}
      />
      {children}
    </label>
  );
};

const Error = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { error } = useImageUpload();
  if (!error) return null;
  return (
    <div className={className} {...props}>
      {error}
    </div>
  );
};

const Preview = ({
  className = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { imageUrl } = useImageUpload();
  if (!imageUrl) return null;
  return <img src={imageUrl} alt="Preview" className={className} {...props} />;
};

const Placeholder = ({
  className = "",
  children = "No image selected",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { imageUrl } = useImageUpload();
  if (imageUrl) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Export the compound component
export const ImageUpload = {
  Provider: ImageUploadProvider,
  Uploader,
  UploadButton,
  Error,
  Preview,
  Placeholder,
};

// Export the hook for custom implementations
export { useImageUpload };
