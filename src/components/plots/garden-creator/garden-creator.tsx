"use client";

// adapted from src/components/marketplace/listing-creator.tsx
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { z } from "zod";
import { FormValidationError } from "@/components/auth/errors";
import { plotCreateSchema } from "@/lib/validations/plots/plots";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { ImageUpload } from "@/components/image-upload";
import Button from "@/components/ui/button";
import { IPlot } from "@/types/plotManagement/plots";
import Image from "next/image";

type FormState = z.infer<typeof plotCreateSchema>;
//type ListingInfo = Omit<FormState, "createdAt" | "updatedAt" | "status">;
type ListingInfo = FormState;

type UpdateFieldProps = {
  field: keyof ListingInfo;
  value: unknown;
};

type PlotCreatorContextType = {
  plotInfo: ListingInfo;
  isLoading: boolean;
  errorMessage: string | null;
  updateField: (props: UpdateFieldProps) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleImageUploadSuccess: (imageUrl: string) => void;
  handleImageRemove: (image: Image) => void;
};

type PlotCreatorProviderProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  userId: string;
  plot: IPlot | null;
  editing: boolean;
};

type Image = {
  url: string;
  isMain: boolean;
};

const PlotCreatorContext = createContext<PlotCreatorContextType | undefined>(
  undefined,
);

const PlotCreatorProvider = ({
  children,
  onSuccess,
  onError,
  redirectTo = "/plots",
  userId,
  plot,
  editing,
}: PlotCreatorProviderProps) => {
  const [plotInfo, setPlotInfo] = useState<ListingInfo>({
    name: plot?.name ?? "",
    description: plot?.description ?? "",
    condition: plot?.condition ?? "",
    location: plot?.location ?? "",
    size: plot?.size ?? 0,
    soilPh: plot?.soilPh ?? "",
    soilType: plot?.soilType ?? "",
    gardenSetting: plot?.gardenSetting ?? "",
    groupType: plot?.groupType ?? "",
    requiredTasks: plot?.requiredTasks ?? [],
    // @ts-expect-error works fine
    plants: plot?.plants ?? [],
    ownerId: userId,
    images: plot?.images ?? [],
  });

  // Update plotInfo when the plot prop changes
  useEffect(() => {
    setPlotInfo({
      name: plot?.name ?? "",
      description: plot?.description ?? "",
      condition: plot?.condition ?? "",
      location: plot?.location ?? "",
      size: plot?.size ?? 0,
      soilPh: plot?.soilPh ?? "",
      soilType: plot?.soilType ?? "",
      gardenSetting: plot?.gardenSetting ?? "",
      groupType: plot?.groupType ?? "",
      requiredTasks: plot?.requiredTasks ?? [],
      // @ts-expect-error works fine
      plants: plot?.plants ?? [],
      ownerId: userId,
      images: plot?.images ?? [],
    });
  }, [plot, userId]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const createPlotMutation = api.plots.create.useMutation({
    onSuccess: (data: { plot: IPlot; message: string }) => {
      onSuccess?.();
      alert(data.message);
      router.push(redirectTo);
      router.refresh();
    },
    onError: (error) => {
      const message = error.message ?? "Something went wrong";
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const updatePlotMutation = api.plots.update.useMutation({
    onSuccess: () => {
      onSuccess?.();
      alert("Plot updated successfully");
      router.push("/plots/management/my-plots");
      router.refresh();
    },
    onError: (error) => {
      const message = error.message ?? "Something went wrong";
      setErrorMessage(message);
      onError?.(message);
    },
  });

  const checkValueConvertsToInt = (stringVal: string) => {
    if (isNaN(parseInt(stringVal))) {
      return 0;
    } else {
      return parseInt(stringVal);
    }
  };

  const updateField = ({ field, value }: UpdateFieldProps) => {
    setPlotInfo((prev) => ({
      ...prev,
      [field]:
        field === "size" ? checkValueConvertsToInt(value as string) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (!userId) {
        throw new FormValidationError("User not found");
      }

      const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
      if (!postcodeRegex.test(plotInfo.location)) {
        throw new FormValidationError("Invalid postcode format");
      }

      const validatedFields = plotCreateSchema.safeParse(plotInfo);

      if (!validatedFields.success) {
        throw new FormValidationError("Please check your input and try again");
      }
      validatedFields.data.location = validatedFields.data.location
        .trim()
        .toUpperCase();
      if (editing && plot) {
        const update_input = {
          id: plot._id.toString(),
          ...validatedFields.data,
        };

        // @ts-expect-error fields will be non empty
        await updatePlotMutation.mutateAsync(update_input);
      } else {
        await createPlotMutation.mutateAsync(validatedFields.data);
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
    setPlotInfo((prev) => ({
      ...prev,

      images:
        prev.images.length > 0
          ? [...(prev.images ?? []), { url: imageUrl, isMain: false }]
          : [...(prev.images ?? []), { url: imageUrl, isMain: true }],
    }));
  };

  const handleImageRemove = (image: Image) => {
    // remove image
    setPlotInfo((prev) => ({
      ...prev,

      /* For multi images */
      images: prev.images?.filter((url) => url !== image),
    }));

    // move main image flag
    if (plotInfo.images.length > 1 && image.isMain) {
      plotInfo.images[0].isMain = true;
    }
  };

  const value: PlotCreatorContextType = {
    plotInfo,
    isLoading: createPlotMutation.status === "pending",
    errorMessage,
    updateField,
    handleSubmit,
    handleImageUploadSuccess,
    handleImageRemove,
  };

  return (
    <PlotCreatorContext.Provider value={value}>
      <ImageUploadWrapper>{children}</ImageUploadWrapper>
    </PlotCreatorContext.Provider>
  );
};

const usePlotCreator = () => {
  const context = useContext(PlotCreatorContext);
  if (context === undefined) {
    throw new FormValidationError(
      "usePlotCreator must be used within a ListingCreatorProvider",
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
  const { handleSubmit } = usePlotCreator();
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
  field: "name" | "size" | "location";
}) => {
  const { plotInfo, updateField } = usePlotCreator();
  return (
    <input
      aria-label={field}
      type={/* field === "price" || field === "quantity" ? "number" : */ "text"}
      value={plotInfo[field]}
      onChange={(e) =>
        updateField({
          field,
          value:
            /* field === "price" || field === "quantity"
              ? Number(e.target.value)
              :  */ e.target.value,
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
  const { plotInfo, updateField } = usePlotCreator();
  return (
    <textarea
      aria-label="description"
      value={plotInfo.description}
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
  field: "condition" | "soilPh" | "soilType" | "gardenSetting" | "groupType";
}) => {
  const { plotInfo, updateField } = usePlotCreator();

  return (
    <select
      aria-label={field}
      value={plotInfo[field]}
      onChange={(e) =>
        updateField({
          field,
          value: e.target.value,
        })
      }
      className={className}
      required={field === "gardenSetting" ? false : true}
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
const ListBuilder = ({
  options,
  field,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>;
  field: "plants";
}) => {
  const [crop, setCrop] = useState("");
  const { plotInfo, updateField } = usePlotCreator();

  if (plotInfo[field]) {
    return (
      <>
        {/* Display the list of selected plants */}
        <div className="flex flex-row flex-wrap gap-2">
          {plotInfo[field].length === 0 ? (
            <div className="text-gray-500">No plants added</div>
          ) : (
            plotInfo[field].map((crop) => (
              <div key={crop} className="flex items-center rounded-md p-2">
                <Button
                  className="rounded-full pl-4"
                  onClick={() => {
                    updateField({
                      field,
                      value: (plotInfo[field] || []).filter((c) => c !== crop),
                    });
                  }}
                >
                  {crop} <XCircleIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Dropdown for autofill */}
        <select
          aria-label={field}
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className={`mt-2 w-full rounded-md border border-gray-300 p-2 text-gray-700 ${className}`}
          {...props}
        >
          <option value="">Select an option </option>
          {options.map((category) => (
            <option key={category.value} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Add button */}
        <Button
          variant="primary"
          className="mt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!crop) return;
            updateField({
              field,
              value: [...(plotInfo[field] || []), crop],
            });
            setCrop("");
          }}
        >
          Add Crop
        </Button>
      </>
    );
  }
};

const TaskBuilder = ({
  field,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: {
    taskTypes: Array<{ value: string; label: string }>;
    frequencies: Array<{ value: string; label: string }>;
    durations: Array<{ value: string; label: string }>;
  };
  field: "requiredTasks";
}) => {
  const [taskType, setTaskType] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");

  const { plotInfo, updateField } = usePlotCreator();

  if (plotInfo[field]) {
    return (
      <>
        {/* Display the list of selected tasks */}
        <div className="flex flex-row flex-wrap gap-2">
          {plotInfo[field].length === 0 ? (
            <div className="text-gray-500">No tasks added</div>
          ) : (
            plotInfo[field].map((task) => (
              <div
                key={task.tType}
                className="flex items-center rounded-md p-2"
              >
                <Button
                  className="rounded-full pl-4"
                  onClick={() => {
                    updateField({
                      field,
                      value: (plotInfo[field] || []).filter((t) => t !== task),
                    });
                  }}
                >
                  {task.tType} for {task.duration},{" "}
                  {task.frequency.toLocaleLowerCase()}{" "}
                  <XCircleIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Dropdown for autofill */}
        <select
          aria-label={field}
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          className={`mt-2 w-full rounded-md border border-gray-300 p-2 text-gray-700 ${className}`}
          {...props}
        >
          <option value="">Select a task type </option>
          {props.options.taskTypes.map((category) => (
            <option key={category.value} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          aria-label={field}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={`mt-2 w-full rounded-md border border-gray-300 p-2 text-gray-700 ${className}`}
          {...props}
        >
          <option value=""> Select a duration </option>
          {props.options.durations.map((category) => (
            <option key={category.value} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          aria-label={field}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={`mt-2 w-full rounded-md border border-gray-300 p-2 text-gray-700 ${className}`}
          {...props}
        >
          <option value=""> Select a frequency </option>
          {props.options.frequencies.map((category) => (
            <option key={category.value} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Add button */}
        <Button
          variant="primary"
          className="mt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!taskType || !frequency || !duration) return;
            updateField({
              field,
              value: [
                ...(plotInfo[field] || []),
                { tType: taskType, frequency, duration },
              ],
            });

            setFrequency("");
            setDuration("");
            setTaskType("");
          }}
        >
          Add Task
        </Button>
      </>
    );
  }
};

/* const LocationSelect = ({
  options,
  className = "",
  field,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: [{ group: string; list: [{ value: string; label: string }] }];
  field: "location";
}) => {
  const { plotInfo, updateField } = usePlotCreator();

  return (
    <select
      key="0"
      aria-label={field}
      value={plotInfo[field]}
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
        <optgroup label={option.group} key={option.group}>
          {option.list.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}; */

// Add new compound component for images
const ImageUploadWrapper = ({ children }: { children: React.ReactNode }) => {
  const { handleImageUploadSuccess } = usePlotCreator();

  return (
    <ImageUpload.Provider onSuccess={handleImageUploadSuccess}>
      {children}
    </ImageUpload.Provider>
  );
};

const ImageDisplay = ({ className = "" }: { className?: string }) => {
  const { plotInfo, handleImageRemove } = usePlotCreator();

  const images = plotInfo.images;

  return (
    <div className={className}>
      {images?.map((image) => (
        <div className="grid grid-cols-2" key={image.url}>
          <div className="h-20"></div>
          <div className="relative">
            <Image
              src={image.url}
              alt="Listing"
              className="h-24 w-24 object-cover"
              layout="fill"
            />
            <button
              type="button"
              onClick={() => handleImageRemove(image)}
              className="absolute -right-2 -top-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const SubmitButton = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLoading } = usePlotCreator();
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
  const { errorMessage } = usePlotCreator();
  if (!errorMessage) return null;
  return <div className={className}>{errorMessage}</div>;
};

export const ListingCreator = {
  Provider: PlotCreatorProvider,
  Form,
  TextField,
  TextArea,
  CategorySelect,
  ListBuilder,
  TaskBuilder,
  SubmitButton,
  Error: FormError,
  ImageDisplay,
};
