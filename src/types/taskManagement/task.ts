import mongoose, { Document, Model } from "mongoose";

export interface ITask {
  taskBoardId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  status: "open" | "inProgress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  important?: boolean;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
}

export interface ITaskBoard {
  title: string;
  category?: string;
  path: string;
  taskID: mongoose.Types.ObjectId[];
  description?: string;
  listed?: boolean;
  updatedAt?: Date; // From timestamp
  createdAt?: Date; // From timestamp
  status: "open" | "inProgress" | "completed";
  owner: mongoose.Types.ObjectId;
  plot?: mongoose.Types.ObjectId;
}

export interface ITaskD extends ITask, Document {}
export interface ITaskBoardD extends ITaskBoard, Document {}

// eslint-disable-next-line
export interface ITaskM extends Model<ITaskD> {}

// eslint-disable-next-line
export interface ITaskBoardM extends Model<ITaskBoardD> {}
