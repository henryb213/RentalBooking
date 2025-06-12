"use client";

import { ITaskBoard } from "@/types/taskManagement/task";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import CreateTaskWindow from "./createtask";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/providers/task";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AboutTaskBoard } from "./files/aboutboard";

const statuses = {
  open: "text-green-700 bg-green-50 ring-green-600/20",
  inProgress: "text-gray-600 bg-gray-50 ring-gray-500/10",
  completed: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
};

const RecentTaskBoards = () => {
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
  const { taskBoards } = useTaskContext();
  return (
    <ul
      role="list"
      className="mx-6 divide-y divide-input border-b border-input"
    >
      {taskBoards.map((taskBoard) => (
        <li
          // @ts-expect-error document may return unknown
          key={taskBoard._id}
        >
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
                onClick={() => router.push("/tasks/taskboard/" + taskBoard._id)}
                className="ring-ring hidden w-full rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-secondary-foreground shadow-sm ring-1 ring-inset hover:cursor-pointer hover:bg-secondary-foreground/40 sm:block"
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
                  className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                >
                  <MenuItem>
                    <button
                      className="block w-full px-3 py-1 text-sm/6 text-secondary-foreground data-[focus]:bg-secondary-foreground/40 data-[focus]:outline-none"
                      // @ts-expect-error Key maybe undefined
                      onClick={() => togglePopup(taskBoard._id)} // Pass taskBoard._id
                    >
                      More Info
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
  );
};

function RecentTaskBoardsHeader() {
  return (
    <div className="border-b border-secondary-foreground/20 bg-background px-4 py-5 sm:px-6">
      <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="-mb-16 -ml-1">
          <h3 className="-mt-7 text-base font-semibold text-secondary-foreground">
            Previously Visited Task Boards
          </h3>
        </div>
        <div className="-mb-2 ml-4 mt-2 flex-shrink-0">
          <CreateTaskWindow buttonText="New TaskBoard" />
        </div>
      </div>
    </div>
  );
}

const RecentCard: React.FC = () => {
  return (
    <div className="-mt-20 ml-10 mr-10 p-12">
      <RecentTaskBoardsHeader />
      <RecentTaskBoards /> {/* Pass taskBoards as a prop */}
    </div>
  );
};

interface taskboardProps {
  taskBoard: ITaskBoard;
}

const TaskBoardCreator: React.FC<taskboardProps> = () => {
  // Fetch the user data by the owner's ID
  const error1 = false;
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-secondary-foreground/65">
      {!error1 ? (
        <p className="truncate">
          Created by {user?.firstName || ""} {user?.lastName || ""}
        </p>
      ) : (
        <p className="truncate">Created by unknown</p>
      )}
    </div>
  );
};

export default RecentCard;
