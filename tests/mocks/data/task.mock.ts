import { Types } from "mongoose";
import type {
  ITask,
  ITaskD,
  ITaskBoard,
  ITaskBoardD,
} from "@/types/taskManagement/task";

/**
 * Generate mock task data
 */
export const createMockTask = (
  overrides?: Partial<ITask>,
  createdById?: string,
): ITask => {
  const createdBy = createdById
    ? new Types.ObjectId(createdById)
    : new Types.ObjectId();

  return {
    taskBoardId: new Types.ObjectId(),
    title: `Test Task ${Math.floor(Math.random() * 1000)}`,
    description: "This is a test task description",
    category: "general",
    status: "open",
    priority: "medium",
    important: false,
    createdBy,
    assignedTo: new Types.ObjectId(),
    dueDate: new Date(),
    ...overrides,
  };
};

/**
 * Generate a mock task document with _id
 * Returns a complete ITaskD object suitable for database operations
 */
export const createMockTaskDocument = (
  overrides?: Partial<ITask>,
  createdById?: string,
  id?: string,
): ITaskD => {
  const task = createMockTask(overrides, createdById);
  const _id = id ? new Types.ObjectId(id) : new Types.ObjectId();

  // Create the document with mongoose properties
  const taskDoc = {
    ...task,
    _id,
  } as ITaskD;

  // Add required mongoose document functions
  taskDoc.id = _id.toString();

  return taskDoc;
};

/**
 * Generate multiple mock task documents
 */
export const createMockTaskDocuments = (
  count: number,
  createdById?: string,
  overridesFn?: (index: number) => Partial<ITask>,
): ITaskD[] => {
  return Array.from({ length: count }).map((_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockTaskDocument(overrides, createdById);
  });
};

/**
 * Generate mock task board data
 */
export const createMockTaskBoard = (
  overrides?: Partial<ITaskBoard>,
  ownerId?: string,
): ITaskBoard => {
  const owner = ownerId ? new Types.ObjectId(ownerId) : new Types.ObjectId();

  return {
    title: `Test Board ${Math.floor(Math.random() * 1000)}`,
    category: "general",
    path: `/tasks/board-${Math.floor(Math.random() * 1000)}`,
    taskID: [new Types.ObjectId(), new Types.ObjectId()],
    description: "This is a test task board",
    listed: true,
    status: "open",
    owner,
    plot: new Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Generate a mock task board document with _id
 */
export const createMockTaskBoardDocument = (
  overrides?: Partial<ITaskBoard>,
  ownerId?: string,
  id?: string,
): ITaskBoardD => {
  const taskBoard = createMockTaskBoard(overrides, ownerId);
  const _id = id ? new Types.ObjectId(id) : new Types.ObjectId();

  // Create the document with mongoose properties
  const taskBoardDoc = {
    ...taskBoard,
    _id,
  } as ITaskBoardD;

  // Add required mongoose document functions
  taskBoardDoc.id = _id.toString();

  return taskBoardDoc;
};

/**
 * Generate multiple mock task board documents
 */
export const createMockTaskBoardDocuments = (
  count: number,
  ownerId?: string,
  overridesFn?: (index: number) => Partial<ITaskBoard>,
): ITaskBoardD[] => {
  return Array.from({ length: count }).map((_, index) => {
    const overrides = overridesFn ? overridesFn(index) : {};
    return createMockTaskBoardDocument(overrides, ownerId);
  });
};
