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
import { ITaskBoardD } from "@/types/taskManagement/task";
import { useRouter } from "next/navigation";
import { useTaskContext } from "@/providers/task";

interface CreateTaskWindowProps {
  buttonText: string;
  setTaskBoards?: React.Dispatch<React.SetStateAction<ITaskBoardD[]>>;
  path?: string;
}

const CreateTaskWindow: React.FC<CreateTaskWindowProps> = ({ buttonText }) => {
  const { setTaskBoards, path } = useTaskContext();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inputValues, setInputValues] = useState({
    category: "",
    description: "",
    plot: "",
    title: "",
  });

  const openPopUp = () => {
    // Open the pop up when button clicked
    if (!session) {
      router.replace("/login");
      return;
    }
    setOpen(true);
  };
  const handleSuccess = (taskBoard: ITaskBoardD) => {
    // Update taskBoards when the mutation is successful
    if (setTaskBoards) {
      setTaskBoards((prevTaskBoards: ITaskBoardD[]) =>
        prevTaskBoards.length < 10
          ? [...prevTaskBoards, taskBoard]
          : prevTaskBoards,
      );
    }
  };

  const createTaskboardMutation = api.taskboards.create.useMutation({
    onSuccess: handleSuccess, // Attach the success handler here
  });

  const handleChange = (field: keyof typeof inputValues, value: string) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    setOpen(false);
    if (status === "authenticated" && session?.user.id) {
      const filteredInputValues = Object.fromEntries(
        Object.entries(inputValues).filter(([_, value]) => value !== ""),
      );

      // Trigger the mutation and rely on onSuccess for handling success
      //@ts-expect-error Filtered input values doesn't have proper type
      createTaskboardMutation.mutate({
        ...filteredInputValues,
        owner: session.user.id,
        path: path,
      });
    }
  };

  return (
    <div>
      <div onClick={() => openPopUp()}>
        <Button
          variant="primary"
          size="lg"
          className="px-3.5 py-2.5 text-sm font-bold"
        >
          {buttonText}
        </Button>
      </div>

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
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
                    Create Your TaskBoard!
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-foreground/60">
                      Please provide the information below to create your new
                      Task Board. Fields marked with a * are required.
                    </p>
                  </div>
                </div>
              </div>
              <InputLabel
                label="Title*"
                placeholder="My Task Board"
                field="title"
                value={inputValues.title}
                onChange={handleChange}
              />
              <InputLabel
                label="Category"
                placeholder="e.g. Cleaning"
                field="category"
                value={inputValues.category}
                onChange={handleChange}
              />
              <InputLabel
                label="Description"
                placeholder="Enter a description of your task board here"
                field="description"
                value={inputValues.description}
                onChange={handleChange}
              />
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <Button
                  variant="primary"
                  onClick={() => handleSubmit()} //  Handle create here
                  className="w-full sm:col-start-2"
                >
                  Create
                </Button>
                <Button
                  variant="secondary"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className="w-full sm:col-start-1"
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
  field: "category" | "description" | "plot" | "title";
  placeholder: string;
  label: string;
  value: string;
  onChange: (
    field: "category" | "description" | "plot" | "title",
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
          className="block w-full rounded-md border-0 bg-background p-2 py-1.5 text-secondary-foreground shadow-sm ring-1 ring-secondary-foreground/40 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
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
          className="block w-full rounded-md border-0 bg-background p-2 py-1.5 text-secondary-foreground shadow-sm ring-1 ring-secondary-foreground/40 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm/6"
        />
      )}
    </div>
  );
};

export default CreateTaskWindow;
