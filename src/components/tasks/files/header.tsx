import React from "react";

import CreateTaskWindow from "@/components/tasks/createtask";
import CreateFolderWindow from "@/components/tasks/files/createfolder";

const FileHeader = () => {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-secondary-foreground-accent text-2xl/7 font-bold sm:truncate sm:text-3xl sm:tracking-tight">
          Your TaskBoards
        </h2>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0">
        <CreateFolderWindow />
        <CreateTaskWindow buttonText="New TaskBoard" />
      </div>
    </div>
  );
};

export default FileHeader;
