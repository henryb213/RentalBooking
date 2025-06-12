"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  TrashIcon,
  StarIcon,
  CalendarIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import mongoose from "mongoose";
import { useSession } from "next-auth/react";
import { ITaskBoardD, ITaskD } from "@/types/taskManagement/task";
import Link from "next/link";

// Define types for tasks
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "open" | "inProgress" | "completed";

interface Task {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  important?: boolean;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: string;
}

const ITEMS_PER_PAGE = 10;

const TaskBoardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);

  const params = useParams();
  const taskboardId = params.id as string;

  const [page, setPage] = useState(1);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("low");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // tRPC queries and mutations
  const utils = api.useUtils();
  const { data: taskboard } = api.taskboards.getById.useQuery<ITaskBoardD>({
    id: taskboardId,
  });
  const { data: tasks, isLoading } = api.tasks.getTasksByBoard.useQuery(
    {
      boardId: taskboardId,
      page,
      limit: ITEMS_PER_PAGE,
    },
    {
      enabled: !!taskboardId,
    },
  );

  const createTask = api.tasks.create.useMutation({
    onSuccess: () => {
      setNewTaskTitle("");
      setNewTaskDescription("");
      setPriority("low");
      setDueDate(null);
      setError(null);
      utils.tasks.getTasksByBoard.invalidate({ boardId: taskboardId });
    },
  });

  const updateTask = api.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getTasksByBoard.invalidate({ boardId: taskboardId });
    },
  });

  const deleteTask = api.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.getTasksByBoard.invalidate({ boardId: taskboardId });
    },
  });

  const toggleTaskStatus = api.tasks.toggleStatus.useMutation({
    onSuccess: () => {
      utils.tasks.getTasksByBoard.invalidate({ boardId: taskboardId });
    },
  });

  const toggleTaskImportance = api.tasks.toggleImportance.useMutation({
    onSuccess: () => {
      utils.tasks.getTasksByBoard.invalidate({ boardId: taskboardId });
    },
  });

  // Update task handling
  const handleTaskAction = (task: ITaskD): Task => ({
    _id: new mongoose.Types.ObjectId(task._id?.toString() ?? ""),
    title: task.title ?? "",
    description: task.description,
    category: task.category ?? "",
    status: task.status as TaskStatus,
    priority: task.priority.toLowerCase() as TaskPriority,
    important: task.important,
    createdBy: new mongoose.Types.ObjectId(task.createdBy?.toString() ?? ""),
    assignedTo: task.assignedTo
      ? new mongoose.Types.ObjectId(task.assignedTo.toString())
      : undefined,
    dueDate: task.dueDate?.toISOString(),
  });

  // Add a new task with validation
  const handleAddTask = () => {
    if (!newTaskTitle) {
      setError("Task title is required.");
      return;
    }
    if (!session?.user?.id) {
      setError("You must be logged in to create tasks.");
      return;
    }
    createTask.mutate({
      taskBoardId: taskboardId,
      title: newTaskTitle,
      description: newTaskDescription || "",
      category: "default",
      priority: priority,
      status: "open",
      createdBy: session.user.id,
      plotId: taskboard?.plot?.toString() || taskboardId,
      dueDate: dueDate?.toISOString(),
    });
  };

  // Define colors for priorities using Tailwind's primary colors
  const priorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
      case "urgent":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-primary";
    }
  };

  // Filter tasks based on sidebar selection
  const getFilteredTasks = () => {
    if (!tasks) return [];

    switch (filter) {
      case "Important":
        return tasks.filter((task) => task.important);
      case "Overdue":
        return tasks.filter(
          (task) => task.dueDate && new Date(task.dueDate) < new Date(),
        );
      case "High":
        return tasks.filter((task) => task.priority === "high");
      case "Medium":
        return tasks.filter((task) => task.priority === "medium");
      case "Low":
        return tasks.filter((task) => task.priority === "low");
      case "Completed":
        return tasks.filter((task) => task.status === "completed");
      case "In Progress":
        return tasks.filter((task) => task.status === "inProgress");
      case "Open":
        return tasks.filter((task) => task.status === "open");
      default:
        return tasks;
    }
  };

  // Update task in edit mode
  const handleUpdateTask = () => {
    if (editingTask) {
      updateTask.mutate({
        id: editingTask._id.toString(),
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate)
          : undefined,
        status:
          editingTask.status === "inProgress"
            ? "in_progress"
            : editingTask.status,
      });
      setEditingTask(null);
    }
  };

  // Helper function to capitalize strings
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Handle keyboard navigation for task items
  const handleTaskKeyPress = (e: React.KeyboardEvent, task: Task) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setEditingTask(task);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex h-full items-center justify-center"
        role="status"
        aria-label="Loading tasks"
      >
        <ArrowPathIcon
          className="h-8 w-8 animate-spin text-blue-500"
          aria-hidden="true"
        />
        <span className="sr-only">Loading tasks</span>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background" role="main">
      {/* Sidebar */}
      <nav
        className="border-border bg-card w-72 border-r p-4"
        role="navigation"
        aria-label="Task filters"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Task Management</h2>
          <Link
            href="/tasks/files"
            className="focus:ring-ring inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-black hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Switch to Files
          </Link>
        </div>

        <Menu as="div" className="space-y-3">
          <Menu.Button
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show all tasks"
          >
            <InboxIcon className="h-5 w-5 text-black" aria-hidden="true" />
            <span className="text-black">All Tasks</span>
          </Menu.Button>
          <Menu.Button
            onClick={() => setFilter("Important")}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show important tasks"
          >
            <StarIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <span className="text-black">Important</span>
          </Menu.Button>
          <Menu.Button
            onClick={() => setFilter("Overdue")}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show overdue tasks"
          >
            <CalendarIcon
              className="h-5 w-5 text-rose-500"
              aria-hidden="true"
            />
            <span className="text-black">Overdue</span>
          </Menu.Button>
          <Menu.Button
            onClick={() => setFilter("High")}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show high priority tasks"
          >
            <ExclamationTriangleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
            <span className="text-black">High Priority</span>
          </Menu.Button>
          <Menu.Button
            onClick={() => setFilter("Medium")}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show medium priority tasks"
          >
            <FlagIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <span className="text-black">Medium Priority</span>
          </Menu.Button>
          <Menu.Button
            onClick={() => setFilter("Low")}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-black hover:bg-accent hover:text-accent-foreground"
            aria-label="Show low priority tasks"
          >
            <CircleStackIcon
              className="h-5 w-5 text-blue-500"
              aria-hidden="true"
            />
            <span className="text-black">Low Priority</span>
          </Menu.Button>
        </Menu>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary" id="taskboard-title">
            {taskboard?.title || "Loading taskboard..."}
          </h1>
        </div>

        {/* Create task form */}
        <form
          className="border-border bg-card mb-8 space-y-4 rounded-lg border p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
          aria-labelledby="create-task-heading"
        >
          <h2 id="create-task-heading" className="sr-only">
            Create new task
          </h2>
          <div role="group" aria-labelledby="task-details">
            <input
              id="task-title"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2"
              required
              aria-required="true"
              aria-invalid={!newTaskTitle}
              aria-describedby={error ? "title-error" : undefined}
            />

            <textarea
              id="task-description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description"
              className="placeholder:text-muted-foreground focus:ring-ring mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Task description"
            />

            <div className="mt-4 flex gap-4">
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="focus:ring-ring rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Select task priority"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <input
                id="task-due-date"
                type="date"
                value={dueDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setDueDate(e.target.value ? new Date(e.target.value) : null)
                }
                className="focus:ring-ring rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-label="Task due date"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Add new task"
              >
                Add Task
              </button>
            </div>
          </div>
          {error && (
            <p id="title-error" className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Task list */}
        <section aria-labelledby="task-list-heading" className="space-y-8">
          <h2 id="task-list-heading" className="sr-only">
            Task list
          </h2>
          {getFilteredTasks().length === 0 ? (
            <p role="status" className="text-muted-foreground text-center">
              No tasks found
            </p>
          ) : (
            <>
              <ul role="list" className="space-y-6">
                {getFilteredTasks().map((task) => {
                  const taskId = task._id as mongoose.Types.ObjectId;
                  return (
                    <li
                      key={taskId.toString()}
                      className="flex flex-col rounded-xl border-2 p-8 shadow-md transition-colors"
                    >
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-6">
                          <button
                            onClick={() =>
                              toggleTaskStatus.mutate({
                                _id: taskId.toString(),
                              })
                            }
                            className="focus:ring-ring mt-1.5 rounded-full hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            aria-label={`Mark task "${task.title}" as ${task.status === "completed" ? "incomplete" : "complete"}`}
                          >
                            <CheckCircleIcon
                              className={`h-7 w-7 ${
                                task.status === "completed"
                                  ? "text-blue-500"
                                  : "text-muted"
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-2xl font-medium text-primary ${task.status === "completed" ? "line-through" : ""}`}
                              onClick={() => {
                                if (editingTask) {
                                  handleUpdateTask();
                                } else {
                                  setEditingTask(handleTaskAction(task));
                                }
                              }}
                              onKeyDown={(e) => {
                                if (editingTask) {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdateTask();
                                  }
                                } else {
                                  handleTaskKeyPress(e, handleTaskAction(task));
                                }
                              }}
                              tabIndex={0}
                              role="button"
                              aria-label={`${editingTask ? "Save" : "Edit"} task: ${task.title}`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-2 text-base text-primary">
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                                <CalendarIcon className="h-5 w-5" />
                                <span>
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-4 sm:items-end">
                          <span
                            className={`inline-flex items-center rounded-full px-12 py-4 text-xl font-medium ${priorityColor(task.priority)} min-w-[200px] justify-center bg-white/50`}
                          >
                            {capitalize(task.priority)} Priority
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                toggleTaskImportance.mutate({
                                  _id: taskId.toString(),
                                })
                              }
                              className="focus:ring-ring rounded-full p-2.5 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              aria-label={`${task.important ? "Remove from" : "Mark as"} important: ${task.title}`}
                            >
                              <StarIcon
                                className={`h-6 w-6 ${
                                  task.important
                                    ? "text-amber-500"
                                    : "text-muted"
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              onClick={() =>
                                deleteTask.mutate({ _id: taskId.toString() })
                              }
                              className="rounded-full p-2.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              aria-label={`Delete task: ${task.title}`}
                            >
                              <TrashIcon
                                className="h-6 w-6 text-red-500"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!tasks || tasks.length < ITEMS_PER_PAGE}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default TaskBoardPage;
