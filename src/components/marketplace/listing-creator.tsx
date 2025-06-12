"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import { FormValidationError } from "@/components/auth/errors";
import { listingCreateSchema } from "@/lib/validations/marketplace/listing.schema";
import { ImageUpload } from "@/components/image-upload";
import {
  PopulatedListing,
  IListing,
} from "@/types/marketplace/listing.interface";
import Image from "next/image";

type FormState = z.infer<typeof listingCreateSchema>;
type ListingInfo = Omit<FormState, "createdAt" | "updatedAt" | "status">;

type UpdateFieldProps = {
  field: keyof ListingInfo;
  value: unknown;
};

type ListingCreatorContextType = {
  listingInfo: ListingInfo;
  isLoading: boolean;
  errorMessage: string | null;
  updateField: (props: UpdateFieldProps) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleImageUploadSuccess: (imageUrl: string) => void;
  handleImageRemove: (imageUrl: string) => void;
};

type ListingCreatorProviderProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  userId: string;
  postcode: string;
  type: "item" | "service" | "share";
  listingData?: PopulatedListing;
};

const ListingCreatorContext = createContext<
  ListingCreatorContextType | undefined
>(undefined);

const ListingCreatorProvider = ({
  children,
  onSuccess,
  onError,
  userId,
  postcode,
  type,
  listingData,
}: ListingCreatorProviderProps) => {
  //console.log("Postcode: " + postcode);
  const taskboardId = listingData?.taskboardId?.toString();
  const taskboardQuery = api.taskboards.getById.useQuery(
    { id: taskboardId || "" },
    {
      refetchOnWindowFocus: false,
      enabled: !!taskboardId, // Only run query if taskboardId exists
    },
  );

  // Initialize state with listingData if provided, otherwise use default values
  const [listingInfo, setListingInfo] = useState<ListingInfo>(() => {
    if (listingData) {
      // Pre-fill with listingData if provided
      return {
        name: listingData.name,
        path: "",
        price: listingData.price,
        quantity: listingData.quantity ?? 1,
        type: listingData.type,
        category: listingData.category,
        imageUrls: listingData.imageUrls ?? [],
        description: listingData.description,
        pickupmethod: listingData.pickupmethod ?? "myloc",
        postcode: listingData.postcode,
        createdBy: userId,
      };
    } else {
      // Use default values if no listingData is provided
      return {
        name: "",
        path: "",
        price: 0,
        quantity: 1,
        type,
        category: "",
        imageUrls: [],
        description: "",
        pickupmethod: "myloc",
        postcode: postcode,
        createdBy: userId,
      };
    }
  });

  useEffect(() => {
    if (taskboardQuery.data && listingData?.taskboardId) {
      const path =
        (taskboardQuery.data?.path || "/") + (taskboardQuery.data?.title || "");
      setListingInfo((prev) => ({
        ...prev,
        path,
      }));
    }
  }, [taskboardQuery.data, listingData?.taskboardId]);

  useEffect(() => {
    setListingInfo((prev) => ({
      ...prev,
      createdBy: userId,
    }));
  }, [userId]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const createListingMutation = api.marketplace.create.useMutation({
    onSuccess: (createdListing) => {
      onSuccess?.();
      // @ts-expect-error ID will always be defined
      router.push(`/marketplace/item/${createdListing._id}`);
      router.refresh();
    },
    onError: (error) => {
      const message = error.message ?? "Something went wrong";
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const updateListingMutation = api.marketplace.update.useMutation<IListing>({
    onSuccess: (updatedListing) => {
      // @ts-expect-error ID will always be defined
      router.push(`/marketplace/item/${updatedListing._id}`);
      router.refresh();
    },
    onError: (error) => {
      const message = error.message ?? "Something went wrong";
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const updateField = ({ field, value }: UpdateFieldProps) => {
    setListingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (!userId) {
        throw new FormValidationError("User not found");
      }

      const validatedFields = listingCreateSchema.safeParse(listingInfo);
      console.log(validatedFields);

      if (!validatedFields.success) {
        throw new FormValidationError("Please check your input and try again");
      }

      if (listingData?.id) {
        // Update mutation if `listingData` exists (editing a listing)
        await updateListingMutation.mutateAsync({
          ...validatedFields.data,
          id: listingData.id, // Pass the ID of the listing being updated
        });
      } else {
        // Create mutation if `listingData` doesn't exist
        await createListingMutation.mutateAsync(validatedFields.data);
      }
    } catch (err) {
      let message = "Something went wrong";

      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String(err.message);
      }

      setErrorMessage(message);
      onError?.(message);
    }
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    setListingInfo((prev) => ({
      ...prev,
      imageUrls: [...(prev.imageUrls ?? []), imageUrl],
    }));
  };

  const handleImageRemove = (imageUrl: string) => {
    setListingInfo((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((url) => url !== imageUrl),
    }));
  };

  const value: ListingCreatorContextType = {
    listingInfo,
    isLoading: createListingMutation.status === "pending",
    errorMessage,
    updateField,
    handleSubmit,
    handleImageUploadSuccess,
    handleImageRemove,
  };

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) return;

  return (
    <ListingCreatorContext.Provider value={value}>
      <ImageUploadWrapper>{children}</ImageUploadWrapper>
    </ListingCreatorContext.Provider>
  );
};

const useListingCreator = () => {
  const context = useContext(ListingCreatorContext);
  if (context === undefined) {
    throw new FormValidationError(
      "useListingCreator must be used within a ListingCreatorProvider",
    );
  }
  return context;
};

// Compound components
const Form = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { handleSubmit } = useListingCreator();
  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

const TextField = ({
  field,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  field: keyof Omit<ListingInfo, "status">;
}) => {
  const { listingInfo, updateField } = useListingCreator();
  return (
    <input
      aria-label={field}
      type={field === "price" || field === "quantity" ? "number" : "text"}
      value={listingInfo[field]}
      onChange={(e) =>
        updateField({
          field,
          value:
            field === "price" || field === "quantity"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value,
        })
      }
      className={className}
      required
      {...props}
    />
  );
};

const TextArea = ({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const { listingInfo, updateField } = useListingCreator();
  return (
    <textarea
      aria-label="description"
      value={listingInfo.description}
      onChange={(e) =>
        updateField({
          field: "description",
          value: e.target.value,
        })
      }
      className={className}
      required
      {...props}
    />
  );
};

const CategorySelect = ({
  options,
  className = "",
  field,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
  field: "category" | "pickupmethod";
}) => {
  const { listingInfo, updateField } = useListingCreator();
  return (
    <select
      aria-label={field}
      value={listingInfo[field]}
      onChange={(e) =>
        updateField({
          field,
          value: e.target.value,
        })
      }
      className={className}
      required
      {...props}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const SubmitButton = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLoading } = useListingCreator();
  return (
    <button type="submit" disabled={isLoading} className={className} {...props}>
      {children}
    </button>
  );
};

const FormError = ({
  className = "",
}: {
  className?: string;
  icon?: boolean;
}) => {
  const { errorMessage } = useListingCreator();
  if (!errorMessage) return null;
  return <div className={className}>{errorMessage}</div>;
};

// Add new compound component for images
const ImageUploadWrapper = ({ children }: { children: React.ReactNode }) => {
  const { handleImageUploadSuccess } = useListingCreator();

  return (
    <ImageUpload.Provider onSuccess={handleImageUploadSuccess}>
      {children}
    </ImageUpload.Provider>
  );
};

const ImageList = ({ className = "" }: { className?: string }) => {
  const { listingInfo, handleImageRemove } = useListingCreator();

  return (
    <div className={className}>
      {listingInfo.imageUrls?.map((url, index) => (
        <div key={index} className="grid grid-cols-2">
          <div className="relative">
            <Image
              src={url}
              alt="Listing"
              className="h-24 w-24 object-cover"
              width={200}
              height={200}
            />
            <button
              type="button"
              onClick={() => handleImageRemove(url)}
              className="absolute -right-4 -top-2 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListingCreator = {
  Provider: ListingCreatorProvider,
  Form,
  TextField,
  TextArea,
  CategorySelect,
  SubmitButton,
  Error: FormError,
  ImageUploadWrapper,
  ImageList,
};
