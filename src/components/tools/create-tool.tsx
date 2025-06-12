"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { createToolSchema } from "@/lib/validations/tools";
import { PhotoIcon } from "@heroicons/react/24/solid";
import React from "react";

const CreateToolModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [inputValues, setInputValues] = useState({
    name: "",
    description: "",
    category: "lawn",
    condition: "new",
    ownerId: "12345678",
  });

  // Function to handle modal open/close
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // initialise Next.js router for navigation after successful form submission
  const router = useRouter();

  // define the mutation for creating new tools (using tRPC)
  const createToolMutation = api.tools.create.useMutation();

  const handleChange = (field: keyof typeof inputValues, value: string) => {
    setInputValues({
      ...inputValues,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (status === "authenticated" && session?.user.id) {
      const updatedValues = { ...inputValues, ownerId: session.user.id };

      // validate form data
      const validatedFields = createToolSchema.safeParse(updatedValues);
      if (!validatedFields.success) {
        Error("Please check your input.");
        return;
      }

      // if validation passes, trigger the create tool mutation
      await createToolMutation.mutateAsync(validatedFields.data);

      router.refresh();
    } else {
      router.push("/login");
    }
  };

  const resetInputValues = () => {
    setInputValues({
      name: "",
      description: "",
      category: "lawn",
      condition: "new",
      ownerId: "123456",
    });
  };

  const buttonAction = (type: "submit" | "cancel") => {
    if (type == "submit") {
      handleSubmit();
    }
    resetInputValues();
    closeModal();
  };

  return (
    <>
      <div>
        <button
          onClick={openModal}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          Create Tool
        </button>

        <Dialog open={isOpen} onClose={closeModal} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-green-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      Create Your Tool!
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide the information below to create your new
                        Tool. Fields marked with a * are required.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <InputLabel
                    field="name"
                    label="Tool name"
                    placeholder="Please provide a name for the tool"
                    value={inputValues["name"]}
                    onChange={handleChange}
                  />
                  <InputLabel
                    field="description"
                    label="Tool description"
                    placeholder="Please provide a description for the tool"
                    value={inputValues["description"]}
                    onChange={handleChange}
                  />
                  <Select
                    field="category"
                    label="Tool Category"
                    value={inputValues["category"]}
                    onChange={handleChange}
                    options={[
                      { value: "lawn", label: "Lawn" },
                      { value: "planting", label: "Planting" },
                      { value: "paving", label: "Paving" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <Select
                    field="condition"
                    label="Tool Condition"
                    value={inputValues["condition"]}
                    onChange={handleChange}
                    options={[
                      { value: "new", label: "New" },
                      { value: "excellent", label: "Excellent" },
                      { value: "good", label: "Good" },
                      { value: "fair", label: "Fair" },
                      { value: "poor", label: "Poor" },
                    ]}
                  />
                  <Images />
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <ModalButton
                      type="submit"
                      onChange={buttonAction}
                      label="Submit the new tool"
                      className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:col-start-1"
                    ></ModalButton>
                    <ModalButton
                      type="cancel"
                      onChange={buttonAction}
                      label="Cancel new tool"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-2 sm:mt-0"
                    ></ModalButton>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

interface InputLabelProps {
  field: "name" | "description";
  placeholder: string;
  label: string;
  value: string;
  onChange: (
    field: "name" | "description" | "category" | "condition",
    value: string,
  ) => void;
}

const InputLabel: React.FC<InputLabelProps> = ({
  field,
  placeholder,
  label,
  value,
  onChange,
}) => {
  return (
    <div className="mb-2">
      <label htmlFor={field}>{label}</label>
      {field === "description" ? (
        <textarea
          id={field}
          name={field}
          onChange={(e) => onChange(field, e.target.value)}
          value={value}
          rows={4}
          className="block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm/6"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          id={field}
          name={field}
          onChange={(e) => onChange(field, e.target.value)}
          value={value}
          placeholder={placeholder}
          className="block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm/6"
        />
      )}
    </div>
  );
};

interface SelectProps {
  field: "category" | "condition";
  options: Array<{ value: string; label: string }>;
  label: string;
  value: string;
  onChange: (
    field: "name" | "description" | "category" | "condition",
    value: string,
  ) => void;
}

// Select component for rendering select fields
const Select: React.FC<SelectProps> = ({
  field,
  options,
  label,
  value,
  onChange,
}) => {
  return (
    <div className="mb-2">
      <label htmlFor={field}>{label}</label>
      <select
        id={field}
        name={field}
        onChange={(e) => onChange(field, e.target.value)}
        value={value}
        className="block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm/6"
      >
        {...options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ModalButtonProps {
  type: "submit" | "cancel";
  label: string;
  className: string;
  onChange: (type: "submit" | "cancel") => void;
}

// Modal submit and cancel buttons
const ModalButton: React.FC<ModalButtonProps> = ({
  type,
  label,
  className,
  onChange,
}) => {
  return (
    <button type="button" onClick={() => onChange(type)} className={className}>
      {label}
    </button>
  );
};

// Image upload and drag and drop
const Images = () => (
  <div className="col-span-full">
    <h2 className="block text-lg font-medium font-semibold text-secondary-foreground">
      Tool Image
    </h2>
    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
      <div className="text-center">
        <PhotoIcon
          aria-hidden="true"
          className="mx-auto h-12 w-12 text-gray-300"
        />
        <div className="mt-4 flex text-sm/6 text-secondary-foreground">
          <label
            htmlFor="file-upload"
            className="focus-within:ring-ring relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 hover:text-indigo-500"
          >
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs/5 text-secondary-foreground">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
    </div>
  </div>
);

export default CreateToolModal;
