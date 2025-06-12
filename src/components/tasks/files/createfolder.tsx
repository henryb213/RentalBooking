"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useTaskContext } from "@/providers/task";
import { IFolderD } from "@/types/folder";

const CreateFolderWindow = () => {
  const { setFolders, path } = useTaskContext();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const [inputValues, setInputValues] = useState({
    name: "",
    description: "",
  });
  const { data: folder } = api.folders.getIdByPath.useQuery(
    {
      path: path,
      createdBy: session?.user.id ?? "",
    },
    { enabled: status === "authenticated" },
  );

  const handleSuccess = (folder: IFolderD | null) => {
    if (!folder) {
      return;
    }
    // Update folders when the mutation is successful
    if (setFolders) {
      setFolders((prev) => [...prev, folder]);
    }
  };

  const createFolderMutation = api.folders.create.useMutation({
    onSuccess: handleSuccess, // Attach the success handler here
  });

  const handleSubmit = () => {
    setOpen(false);
    if (status === "authenticated" && session?.user.id && folder) {
      const filteredInputValues = Object.fromEntries(
        Object.entries(inputValues).filter(([_, value]) => value !== ""),
      );

      // Trigger the mutation
      createFolderMutation.mutate({
        ...filteredInputValues,
        createdBy: session.user.id,
        // @ts-expect-error id maybe undefined
        parentFolderId: folder._id, // Use the parent folder ID from the query result
        path: folder.path + inputValues.name + "/",
      });
    } else {
      console.error("Folder data or user session is not available.");
    }
  };

  return (
    <div>
      <div onClick={() => setOpen(true)}>
        <Button
          variant="secondary"
          size="lg"
          className="mr-3 px-3.5 py-2.5 text-sm font-bold"
        >
          New Folder
        </Button>
      </div>

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-secondary-foreground/30 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
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
                    className="text-secondary-foreground-accent text-base font-semibold"
                  >
                    Create a Folder!
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-foreground/60">
                      Please provide the information below to create a new
                      folder. Fields marked with a * are required.
                    </p>
                  </div>
                </div>
              </div>
              <InputLabel
                label="Name*"
                placeholder="My Folder"
                field="name"
                inputValues={inputValues}
                setInputValues={setInputValues}
              />
              <InputLabel
                label="Description"
                placeholder="Enter a description of your folder here"
                field="description"
                inputValues={inputValues}
                setInputValues={setInputValues}
              />
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit()} //  Handle create here
                  className="sm:col-start-2"
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className="sm:col-start-1"
                >
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

interface InputLabelProps {
  field: "name" | "description";
  placeholder: string;
  label: string;
  inputValues: { name: string; description: string };
  setInputValues: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
}

const InputLabel: React.FC<InputLabelProps> = ({
  field,
  placeholder,
  label,
  inputValues,
  setInputValues,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value, // Dynamically update the field based on its name
    }));
  };

  return (
    <div className="mb-2">
      <label htmlFor={field}>{label}</label>
      {field === "description" ? (
        <textarea
          id={field}
          name={field}
          onChange={handleChange}
          value={inputValues[field]}
          rows={4}
          className="block w-full rounded-md border-0 bg-background p-2 py-1.5 text-secondary-foreground shadow-sm ring-1 ring-secondary-foreground/40 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary/80 sm:text-sm/6"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          id={field}
          name={field}
          onChange={handleChange}
          value={inputValues[field]}
          placeholder={placeholder}
          className="/80sm:text-sm/6 block w-full rounded-md border-0 bg-background p-2 py-1.5 text-secondary-foreground shadow-sm ring-1 ring-secondary-foreground/40 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
        />
      )}
    </div>
  );
};

export default CreateFolderWindow;
