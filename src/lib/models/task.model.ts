import {
  ITaskBoardD,
  ITaskBoardM,
  ITaskD,
  ITaskM,
} from "@/types/taskManagement/task";
import { Schema, model, models } from "mongoose";

// TaskBoard Schema
const TaskBoardSchema = new Schema<ITaskBoardD, ITaskBoardM>(
  {
    title: { type: String, required: true },
    path: { type: String, required: true },
    taskID: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    description: { type: String },
    category: { type: String },
    status: {
      type: String,
      enum: ["open", "inProgress", "completed"],
      required: true,
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plot: { type: Schema.Types.ObjectId, ref: "Plot" },
    listed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "TaskBoards",
  },
);

const TaskSchema = new Schema<ITaskD, ITaskM>(
  {
    taskBoardId: {
      type: Schema.Types.ObjectId,
      ref: "TaskBoard",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "inProgress", "completed"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Tasks",
  },
);

// Define and export the typed Task model
const Task = models.Task<ITaskD> || model<ITaskD>("Task", TaskSchema);

const TaskBoard =
  models.TaskBoard<ITaskBoardD> ||
  model<ITaskBoardD>("TaskBoard", TaskBoardSchema);
export { Task, TaskBoard };
