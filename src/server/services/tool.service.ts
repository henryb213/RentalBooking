/*eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/mongo";
import { Tool } from "@/lib/models";
import { z } from "zod";

import {
  allToolsSchema,
  createToolSchema,
  updateToolSchema,
  borrowToolSchema,
  returnToolSchema,
} from "@/lib/validations/tools";
import type { ITool, IToolD } from "@/types/toolManagement/tool";
import { Types } from "mongoose";

export class ToolService {
  static async getAllTools(
    filters?: z.infer<typeof allToolsSchema>,
  ): Promise<IToolD[]> {
    await connectDB();

    const {
      page = 1,
      limit = 10,
      category,
      availability,
      condition,
    } = filters || {};

    // Define the query to filter by category and availability if provided
    const query: any = {};

    if (category) {
      query.category = category;
    }
    if (availability) {
      query.availability = availability;
    }
    if (condition) {
      query.condition = condition;
    }

    try {
      // Find the tools with pagination and filters
      const tools = await Tool.find(query)
        .skip((page - 1) * limit) // Calculate the number of records to skip
        .limit(limit)
        .lean<IToolD[]>()
        .exec();

      // @ts-expect-error type errors
      return tools.map((tool) => {
        // @ts-expect-error type errors
        const toolId: Types.ObjectId = tool._id;
        const ownerId = tool.ownerId;
        return { ...tool, _id: toolId.toJSON(), ownerId: ownerId.toString() };
      });
    } catch (error) {
      console.error("Error fetching tools:", error);
      return [] as IToolD[]; // Return empty list if there's an error
    }
  }

  static async createTool(
    input: z.infer<typeof createToolSchema>,
  ): Promise<ITool> {
    await connectDB();

    const tool = await Tool.create<IToolD>(input);
    return tool.toObject();
  }

  static async getToolById(id: string): Promise<ITool | null> {
    await connectDB();

    const tool = await Tool.findById<IToolD>(id)
      .populate("ownerId") // Populate ownerId with user details
      .populate("currentBorrower.userId") // Populate currentBorrower.userId with user details
      .populate("borrowHistory.userId") // Populate borrowHistory.userId with user details
      .populate("maintenanceLog.performedBy") // Populate maintenanceLog.performedBy with user details
      .exec();

    return !tool ? null : tool;
  }

  static async updateTool(
    updates: z.infer<typeof updateToolSchema>,
  ): Promise<ITool | null> {
    await connectDB();

    const tool = await Tool.findByIdAndUpdate<IToolD>(
      updates.id,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate("ownerId") // Populate ownerId with user details
      .populate("currentBorrower.userId") // Populate currentBorrower.userId with user details
      .populate("borrowHistory.userId") // Populate borrowHistory.userId with user details
      .populate("maintenanceLog.performedBy") // Populate maintenanceLog.performedBy with user details
      .exec();

    // return null if there was no tool with the specified id
    return !tool ? null : tool;
  }

  static async borrowTool(
    updates: z.infer<typeof borrowToolSchema>,
  ): Promise<ITool | null> {
    await connectDB();

    // Prepare the updates for borrowing
    const toolUpdates = {
      $set: {
        availability: "borrowed",
        currentBorrower: {
          userId: "",
          borrowDate: updates.borrowDate,
          expectedReturnDate: updates.expectedReturnDate,
        },
      },
    };

    const tool = await Tool.findByIdAndUpdate<IToolD>(updates.id, toolUpdates, {
      new: true,
      runValidators: true,
    })
      .populate("ownerId") // Populate ownerId with user details
      .populate("currentBorrower.userId") // Populate currentBorrower.userId with user details
      .populate("borrowHistory.userId") // Populate borrowHistory.userId with user details
      .populate("maintenanceLog.performedBy") // Populate maintenanceLog.performedBy with user details
      .exec();

    // return null if there was no tool with the specified id
    return !tool ? null : tool;
  }

  static async returnTool(
    updates: z.infer<typeof returnToolSchema>,
  ): Promise<ITool | null> {
    await connectDB();

    const toolUpdates = {
      $set: {
        availability: "available",
        condition: updates.condition,
        currentBorrower: null,
      },
      // add the borrow entry to the borrow history
      $push: {
        borrowHistory: {
          userId: updates.borrowerID,
          returnDate: new Date(),
          condition: updates.condition,
        },
      },
    };

    const tool = await Tool.findByIdAndUpdate<IToolD>(updates.id, toolUpdates, {
      new: true,
      runValidators: true,
    })
      .populate("ownerId")
      .populate("currentBorrower.userId")
      .populate("borrowHistory.userId")
      .populate("maintenanceLog.performedBy")
      .exec();

    return !tool ? null : tool;
  }

  static async removeTool(id: string): Promise<boolean> {
    await connectDB();

    const result = await Tool.findByIdAndDelete(id);
    return result !== null;
  }
}
