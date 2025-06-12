"use client";

import { ITaskBoardD } from "@/types/taskManagement/task";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { AboutTaskBoard } from "./aboutboard";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/providers/task";
import { useRouter } from "next/navigation";

const statuses = {
  open: "text-green-700 bg-green-50 ring-green-600/20",
  inProgress: "text-secondary-foreground bg-background ring-primary/80",
  completed: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
};

export const TaskBoards: React.FC<{
  searchValue: string;
  selectedSort: "name" | "status" | "date";
}> = ({ searchValue, selectedSort }) => {
  const { taskBoards, setTaskBoards } = useTaskContext();
  const [filteredTaskboards, setFilteredTaskboards] =
    useState<ITaskBoardD[]>(taskBoards);
  const [selectedTaskBoardId, setSelectedTaskBoardId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const togglePopup = (id: string) => {
    if (selectedTaskBoardId === id) {
      setSelectedTaskBoardId(null); // Close the popup if it's already open
    } else {
      setSelectedTaskBoardId(id); // Open the popup for the selected task board
    }
  };

  const { data: session, status } = useSession();
  const deleteTaskboardMutation = api.taskboards.delete.useMutation();

  useEffect(() => {
    // Function to fetch or update task boards
    const fetchTaskBoards = () => {
      if (status === "authenticated" && session) {
        // If search is empty, show all taskBoards
        if (!searchValue.trim()) {
          setFilteredTaskboards(taskBoards);
        } else {
          // Filter based on search
          setFilteredTaskboards(
            taskBoards.filter((item: ITaskBoardD) =>
              item.title.toLowerCase().includes(searchValue.toLowerCase()),
            ),
          );
        }
      }
    };

    fetchTaskBoards();
  }, [status, session, searchValue, taskBoards]); // Remove filtered-related dependencies

  // Second useEffect - Handle sorting
  useEffect(() => {
    if (filteredTaskboards.length === 0) return;

    const sorted: ITaskBoardD[] = [...filteredTaskboards];

    switch (selectedSort) {
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        sorted.sort((a, b) => b.status.localeCompare(a.status));
        break;
      case "date":
        sorted.sort((a, b) => {
          if (a.updatedAt && b.updatedAt) {
            return (
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
          }
          return 0;
        });
        break;
    }

    // Only update if the order has actually changed
    if (JSON.stringify(sorted) !== JSON.stringify(filteredTaskboards)) {
      setFilteredTaskboards(sorted);
    }
  }, [selectedSort, filteredTaskboards]);

  const handleDelete = (id: string) => {
    deleteTaskboardMutation.mutate(
      { _id: id },
      {
        onSuccess: () => {
          setTaskBoards(taskBoards.filter((taskBoard) => taskBoard._id !== id));
        },
        onError: (error) => {
          if (error.data?.code.includes("FORBIDDEN")) {
            alert(
              "This taskboard cannot be deleted because it is linked to a plot",
            );
          }
        },
      },
    );
  };

  return (
    <div>
      <ul
        role="list"
        className="mx-6 divide-y divide-input border-b border-input"
      >
        {filteredTaskboards.map((taskBoard: ITaskBoardD) => (
          // @ts-expect-error document may return unknown
          <li key={taskBoard._id}>
            <AboutTaskBoard
              togglePopup={setSelectedTaskBoardId}
              showPopup={selectedTaskBoardId === taskBoard._id}
              taskBoard={taskBoard}
            />
            <div
              // @ts-expect-error document may return unknown
              key={taskBoard._id}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm/6 font-semibold text-secondary-foreground">
                    {taskBoard.title}
                  </p>
                  <p
                    className={cn(
                      statuses[taskBoard.status],
                      "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                    )}
                  >
                    {taskBoard.status}
                  </p>
                </div>
                <TaskBoardCreator taskBoard={taskBoard} />
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <div
                  onClick={() =>
                    router.push("/tasks/taskboard/" + taskBoard._id)
                  }
                  className="ring-ring hidden rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset hover:cursor-pointer hover:bg-secondary-foreground/40 sm:block"
                >
                  View project
                  <span className="sr-only">, {taskBoard.title}</span>
                </div>
                <Menu as="div" className="relative flex-none">
                  <MenuButton className="-m-2.5 block p-2.5 text-secondary-foreground/60 hover:text-secondary-foreground/80">
                    <span className="sr-only">Open options</span>
                    <EllipsisVerticalIcon
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="ring-primary-80 absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-opacity-5 transition focus:outline-none"
                  >
                    <MenuItem>
                      <button
                        className="block w-full px-3 py-1 text-sm/6 text-secondary-foreground hover:bg-secondary-foreground/40 data-[focus]:bg-secondary-foreground/40 data-[focus]:outline-none"
                        // @ts-expect-error Key maybe undefined
                        onClick={() => togglePopup(taskBoard._id)} // Pass taskBoard._id
                      >
                        More Info
                        <span className="sr-only">, {taskBoard.title}</span>
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        // @ts-expect-error id maybe undefined
                        onClick={() => handleDelete(taskBoard._id)}
                        className="block w-full px-3 py-1 text-sm/6 text-secondary-foreground data-[focus]:bg-secondary-foreground/40 data-[focus]:outline-none"
                      >
                        Delete
                        <span className="sr-only">, {taskBoard.title}</span>
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface taskboardProps {
  taskBoard: ITaskBoardD;
}

const TaskBoardCreator: React.FC<taskboardProps> = ({ taskBoard }) => {
  // Fetch the user data by the owner's ID
  const { data, isLoading, error } = api.user.getById.useQuery({
    id: taskBoard.owner.toString(),
  });

  return (
    <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-secondary-foreground/65">
      <p className="truncate">
        Created by{" "}
        {isLoading ? (
          <span>Loading...</span>
        ) : error ? (
          <span>unknown</span>
        ) : (
          data?.firstName || "" + data?.lastName || ""
        )}
      </p>
    </div>
  );
};
