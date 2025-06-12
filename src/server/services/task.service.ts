import { connectDB } from "@/lib/mongo";
import { z } from "zod";
import mongoose, { Types } from "mongoose";
import { Task, TaskBoard, Folder } from "@/lib/models";
import {
  getAllSchema,
  createSchema,
  getNumberOfTasksSchema,
  deleteSchema,
  getByIDSchema,
  updateSchema,
  toggleStatusSchema,
  toggleImportanceSchema,
} from "@/lib/validations/task";
import {
  getMostRecentSchema,
  getAllTaskboardSchema,
  createTaskboardSchema,
  deleteTaskboardSchema,
  updateTaskboardSchema,
} from "@/lib/validations/taskboard";

import { ITaskBoardD, ITaskD } from "@/types/taskManagement/task";
import { IFolderD } from "@/types/folder";
import { PlotsService } from "./plots.service";
import { FolderService } from "./folder.service";

export class TaskFolderService {
  static async getAllFolderTasks(
    input: z.infer<typeof getAllTaskboardSchema>,
  ): Promise<{
    taskboards: ITaskBoardD[];
    folders: IFolderD[];
    hasNextPage: boolean;
  }> {
    await connectDB();
    const curFolder = await FolderService.getIdByPath({
      path: input.path,
      createdBy: input.owner,
    });
    const query = { createdBy: input.owner, parentFolderId: curFolder._id };
    const totalFolders = await Folder.countDocuments(query);

    // Get folders for current page
    const plotIds: Types.ObjectId[] = await PlotsService.getMyPlots(
      input.owner,
    );
    const { folders, hasNextPage } = await FolderService.getFolders({
      path: input.path,
      createdBy: input.owner,
      plotIds: plotIds.map((e) => {
        return e.toString();
      }),
      page: input.page,
      limit: input.limit,
    });

    // Get remaining slots for taskboards
    const remainingSlots = input.limit - folders.length;
    // calculate skip for taskboards
    let skip = 0;
    if (remainingSlots < input.limit) {
      skip = 0;
    } else {
      skip = (input.page - 1) * input.limit - totalFolders;
    }

    // Then get taskboards only if we have remaining slots, using totalFolders for skip calculation
    const taskboards =
      remainingSlots > 0
        ? await TaskBoard.find<ITaskBoardD>({
            $or: [
              { owner: input.owner },
              { plot: { $in: plotIds } }, // Get taskboards for plots
            ],
            path: input.path,
          })
            .skip(skip)
            .limit(remainingSlots + 1)
            .lean<ITaskBoardD[]>()
        : [];

    const hasNextTaskPage = taskboards.length > remainingSlots;
    const paginatedTaskboards = hasNextTaskPage
      ? taskboards.slice(0, -1)
      : taskboards;

    return {
      taskboards: paginatedTaskboards,
      folders,
      hasNextPage: hasNextPage || hasNextTaskPage,
    };
  }
}

export class TaskService {
  static async getTasksByBoard({
    boardId,
    page,
    limit,
  }: {
    boardId: string;
    page: number;
    limit: number;
  }): Promise<ITaskD[]> {
    await connectDB();
    const skip = (page - 1) * limit;

    const tasks = await Task.find<ITaskD>({ taskBoardId: boardId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return tasks;
  }

  static async getAll(input: z.infer<typeof getAllSchema>): Promise<ITaskD[]> {
    await connectDB();

    const query: Partial<Pick<ITaskD, "status" | "category" | "assignedTo">> =
      {};
    if (input.status) query.status = input.status;
    if (input.category) query.category = input.category;
    if (input.assignedTo)
      query.assignedTo = new mongoose.Types.ObjectId(input.assignedTo);

    const tasks = await Task.find<ITaskD>(query)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit);

    return tasks;
  }

  static async create(input: z.infer<typeof createSchema>): Promise<ITaskD> {
    await connectDB();

    const task = await Task.create<ITaskD>(input);

    return task;
  }

  static async update(input: z.infer<typeof updateSchema>): Promise<ITaskD> {
    await connectDB();

    const task = await Task.findByIdAndUpdate<ITaskD>(input.id, input, {
      new: true,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  }

  static async toggleStatus(
    input: z.infer<typeof toggleStatusSchema>,
  ): Promise<ITaskD> {
    await connectDB();

    const task = await Task.findById(input._id);
    if (!task) {
      throw new Error("Task not found");
    }

    const newStatus = task.status === "completed" ? "open" : "completed";
    task.status = newStatus;
    await task.save();

    return task;
  }

  static async toggleImportance(
    input: z.infer<typeof toggleImportanceSchema>,
  ): Promise<ITaskD> {
    await connectDB();

    const task = await Task.findById(input._id);
    if (!task) {
      throw new Error("Task not found");
    }

    task.important = !task.important;
    await task.save();

    return task;
  }

  static async delete(input: z.infer<typeof deleteSchema>): Promise<boolean> {
    await connectDB();

    const result = await Task.findByIdAndDelete(input._id);
    return !!result;
  }

  static async getById(
    input: z.infer<typeof getByIDSchema>,
  ): Promise<ITaskD | null> {
    await connectDB();
    return await Task.findById(input.id);
  }

  static async getNumberOfTasks(
    input: z.infer<typeof getNumberOfTasksSchema>,
  ): Promise<number> {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (input.status) query.status = input.status;
    if (input.id) query.assignedTo = input.id;

    if (input.overdue) query.dueDate = { $lt: new Date() }; // $lt : less than

    if (input.createdInLast) {
      const today = new Date();

      switch (input.createdInLast) {
        case "1 Month":
          today.setMonth(today.getMonth() - 1);
          query.createdAt = { $gt: today }; // $gt : greater than
          break;
        case "1 Week":
          today.setDate(today.getDate() - 7);
          query.createdAt = { $gt: today };
          break;
        case "24 Hours":
          today.setDate(today.getDate() - 1);
          query.createdAt = { $gt: today };
          break;
        default:
          break;
      }
    }

    return await Task.countDocuments(query);
  }
}

export class TaskboardService {
  /**
   * Get a taskboard by ID
   * @param input { id: string }
   * @returns ITaskBoardD | null
   */
  static async getById(input: { id: string }): Promise<ITaskBoardD | null> {
    await connectDB();
    return await TaskBoard.findById(input.id);
  }

  static async getByPath(input: {
    path: string;
    title: string;
    owner: string;
  }): Promise<ITaskBoardD | null> {
    await connectDB();
    return await TaskBoard.findOne(input);
  }

  /**
   * Get the 5 most recent taskboards
   * @param input getMostRecentSchema
   * @returns 5 most recent taskboards
   */
  static async getMostRecent(
    input: z.infer<typeof getMostRecentSchema>,
  ): Promise<ITaskBoardD[]> {
    await connectDB();

    const query = { owner: input.owner };

    const taskboards = await TaskBoard.find<ITaskBoardD>(query)
      .sort({ updatedAt: -1 })
      .limit(5);
    return taskboards;
  }

  /**
   * Returns all taskboards in the database.
   * @param input getAllTaskboardSchema
   * @returns ITaskBoardD[]
   */
  static async getAll(
    input: z.infer<typeof getAllTaskboardSchema>,
  ): Promise<{ taskboards: ITaskBoardD[]; hasNextPage: boolean }> {
    await connectDB();

    const query = {
      path: input.path,
      $or: [{ owner: input.owner }, { users: { $in: input.owner } }],
    };

    const taskboards = await TaskBoard.find<ITaskBoardD>(query)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit + 1);

    const hasNextPage = taskboards.length > input.limit;
    const paginatedTaskboards = hasNextPage
      ? taskboards.slice(0, -1)
      : taskboards;

    return {
      taskboards: paginatedTaskboards,
      hasNextPage,
    };
  }

  /**
   * Update a given entry in the taskboard collection
   * @param input updateTaskboardSchema
   * @returns ITaskBoard | null
   */
  static async update(
    input: z.infer<typeof updateTaskboardSchema>,
  ): Promise<ITaskBoardD | null> {
    await connectDB();
    console.log("Updating taskboard with input: ", input);
    // Index by ID and apply the input to taskboard.
    const taskboard = await TaskBoard.findOneAndUpdate<ITaskBoardD>(
      { _id: input._id },
      input,
      { new: true },
    );

    return taskboard;
  }

  /**
   * Get a taskboard by plot ID
   * @param input { plotID: string }
   * @returns ITaskBoardD | null
   */
  static async getTaskboardByPlotID(input: {
    plotID: string;
  }): Promise<ITaskBoardD | null> {
    await connectDB();
    const taskboard = await TaskBoard.findOne<ITaskBoardD>({
      plot: input.plotID,
    });
    return taskboard;
  }

  /**
   * Create a taskboard with the given parameters.
   * @param input createTaskboardSchema
   * @returns ITaskBoardD : The created taskboard.
   */
  static async create(
    input: z.infer<typeof createTaskboardSchema>,
  ): Promise<ITaskBoardD> {
    await connectDB();
    const currentDate = new Date();

    // Filter out path for now as DB doesnt support it
    const query = {
      ...input,
      createdAt: currentDate,
      updatedAt: currentDate,
      status: "open",
    };

    const taskboard = await TaskBoard.create<ITaskBoardD>(query);
    return taskboard.toObject();
  }

  /**
   * Delete a taskboard. Returns if successful (True).
   * @param input deleteTaskboardSchema
   * @returns boolean
   */
  static async delete(
    input: z.infer<typeof deleteTaskboardSchema>,
  ): Promise<boolean> {
    await connectDB();
    if (input.flag == undefined) {
      const taskboard = await TaskBoard.findById(input._id);
      if (taskboard?.plot !== undefined) {
        throw new Error(
          "[PLOT_LINKED] Cannot delete taskboard as it is associated with a plot",
        );
      } else {
        const res = await TaskBoard.deleteOne({ _id: input._id });
        return res.acknowledged;
      }
    } else {
      const res = await TaskBoard.deleteOne({ _id: input._id });
      return res.acknowledged;
    }
  }
}
