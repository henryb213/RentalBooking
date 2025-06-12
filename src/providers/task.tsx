"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { ITaskBoardD } from "@/types/taskManagement/task";
import { IFolderD } from "@/types/folder";
import { Dispatch, SetStateAction } from "react";

interface TaskContextType {
  taskBoards: ITaskBoardD[];
  setTaskBoards: Dispatch<SetStateAction<ITaskBoardD[]>>;
  folders: IFolderD[];
  setFolders: Dispatch<SetStateAction<IFolderD[]>>;
  path: string;
  setPath: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  hasNextPage: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [taskBoards, setTaskBoards] = useState<ITaskBoardD[]>([]);
  const [folders, setFolders] = useState<IFolderD[]>([]);
  const [path, setPath] = useState("/");
  const { data: session } = useSession();
  const [page, setPage] = useState(1);

  const {
    data: taskData,
    isLoading: isLoading,
    error: error,
  } = api.taskboards.getAllTaskFolders.useQuery(
    { path, owner: session?.user.id || "", page },
    { enabled: !!session?.user },
  );

  useEffect(() => {
    if (taskData) setTaskBoards(taskData.taskboards);
    if (taskData) setFolders(taskData.folders);
  }, [taskData]);

  if (error) {
    console.error("Error loading data:", error);
  }

  return (
    <TaskContext.Provider
      value={{
        taskBoards,
        setTaskBoards,
        folders,
        setFolders,
        path,
        setPath,
        isLoading,
        page,
        setPage,
        hasNextPage: taskData?.hasNextPage || false,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
