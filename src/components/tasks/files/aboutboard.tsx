import React from "react";
import { ITaskBoard } from "@/types/taskManagement/task";
import Button from "@/components/ui/button";

interface AboutProps {
  taskBoard: ITaskBoard;
  showPopup: boolean;
  togglePopup: React.Dispatch<React.SetStateAction<string | null>>;
}

// Smaller reusable component for rendering each property row
const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-background px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3">
    <dt className="text-sm/6 font-medium text-secondary-foreground">{label}</dt>
    <dd className="mt-1 text-sm/6 text-secondary-foreground/70 sm:col-span-2 sm:mt-0">
      {value}
    </dd>
  </div>
);

export const AboutTaskBoard: React.FC<AboutProps> = ({
  taskBoard,
  showPopup,
  togglePopup,
}) => {
  return (
    <div>
      {/* Background Overlay */}
      {showPopup && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => togglePopup(null)}
        />
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50">
          <div className="w-full max-w-lg rounded bg-background p-4 shadow-lg">
            <div className="px-4 sm:px-0">
              <h3 className="text-base/7 font-semibold text-secondary-foreground">
                TaskBoard Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm/6 text-secondary-foreground/75">
                Extra information about your TaskBoard.
              </p>
            </div>
            <div className="mt-6 border-t border-secondary-foreground/5">
              <dl className="divide-y divide-secondary-foreground/5">
                <InfoRow
                  label="Full Path"
                  value={taskBoard.path + taskBoard.title}
                />
                <InfoRow
                  label="Category"
                  value={taskBoard.category || "No Category Provided"}
                />
                <InfoRow
                  label="Assigned Plot ID"
                  value={taskBoard.plot?.toString() || "Not Provided"}
                />
                <InfoRow
                  label="Created At"
                  value={
                    taskBoard.createdAt
                      ? new Date(taskBoard.createdAt).toString()
                      : "Unknown"
                  }
                />
                <InfoRow
                  label="Last Updated At"
                  value={
                    taskBoard.updatedAt
                      ? new Date(taskBoard.updatedAt).toString()
                      : "Unknown"
                  }
                />
                <InfoRow
                  label="Number of Tasks"
                  value={taskBoard.taskID.length.toString()}
                />
                <InfoRow
                  label="Description"
                  value={taskBoard.description || "No Description"}
                />
              </dl>
            </div>
            <Button
              onClick={() => togglePopup(null)}
              variant="primary"
              className="w-full"
              size="md"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
