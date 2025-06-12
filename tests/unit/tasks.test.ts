jest.mock("@/auth", () => ({
  auth: jest.fn(() => Promise.resolve({ user: { id: "mock-user-id" } })),
}));

import { Types } from "mongoose";
import { TaskService } from "@/server/services/task.service";
import * as testHelper from "../helpers/test-service-helper";
import { Task } from "@/lib/models";
import { createMockTaskDocument } from "../mocks/data/task.mock";

beforeAll(async () => {
  await testHelper.initializeTestEnvironment();
});

afterEach(async () => {
  await testHelper.clearTestData();
});

afterAll(async () => {
  await testHelper.cleanupTestEnvironment();
});

describe("TaskService", () => {
  describe("create", () => {
    it("should create a task", async () => {
      const mockTask = createMockTaskDocument({
        title: "Test Task",
        description: "This is a test task",
      });

      // creates the task using the service
      const createdTask = await new Task(mockTask).save();
      expect(createdTask).toBeDefined();
      expect(createdTask.title).toBe("Test Task");

      const found = await Task.findById(createdTask._id);
      expect(found).not.toBeNull();
      expect(found?.description).toBe("This is a test task");
    });
  });

  describe("update", () => {
    it("should update a task by id", async () => {
      const mockTask = createMockTaskDocument({ title: "OG Title" });
      const savedTask = await new Task(mockTask).save();
      const taskID = savedTask._id.toString();

      // updates it using the service
      const updated = await TaskService.update({
        id: taskID,
        title: "Title 2.0",
      });

      // checks that it was updated
      expect(updated).not.toBeNull();
      expect(updated.title).toBe("Title 2.0");
    });

    it("should throw if task is not found", async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(
        TaskService.update({
          id: fakeId,
          title: "Should not exist",
        }),
      ).rejects.toThrow("Task not found");
    });
  });

  describe("delete", () => {
    it("should delete task", async () => {
      const createdTask = await new Task(createMockTaskDocument()).save();
      const taskID = (createdTask._id as Types.ObjectId).toString();

      const deleted = await TaskService.delete({ _id: taskID });
      expect(deleted).toBe(true);

      const fromDb = await Task.findById(taskID);
      expect(fromDb).toBeNull();
    });
    it("should return false if task doesn't exist", async () => {
      const result = await TaskService.delete({
        _id: new Types.ObjectId().toString(),
      });

      expect(result).toBe(false);
    });
  });

  describe("getById", () => {
    it("should return a task by id", async () => {
      const createdTask = await new Task(createMockTaskDocument()).save();
      const taskID = String(createdTask._id);
      const result = await TaskService.getById({ id: taskID });

      expect(result).not.toBeNull();
      expect(String(result?._id)).toBe(taskID);
      expect(result?.title).toBe(createdTask.title);
    });

    it("should return null if task is not found", async () => {
      const result = await TaskService.getById({
        id: new Types.ObjectId().toString(),
      });

      expect(result).toBeNull();
    });
  });

  describe("toggleStatus", () => {
    it("should switch between open and completed statuses", async () => {
      const created = await new Task(
        createMockTaskDocument({ status: "open" }),
      ).save();
      const taskID = String(created._id);

      const toggled1 = await TaskService.toggleStatus({ _id: taskID });
      expect(toggled1.status).toBe("completed");

      const toggled2 = await TaskService.toggleStatus({ _id: taskID });
      expect(toggled2.status).toBe("open");
    });

    it("should flip inProgress to completed", async () => {
      const created = await new Task(
        createMockTaskDocument({ status: "inProgress" }),
      ).save();
      const taskID = String(created._id);

      const theToggler = await TaskService.toggleStatus({ _id: taskID });
      expect(theToggler.status).toBe("completed");
    });

    it("should trigger if task can't be found", async () => {
      const fakeId = new Types.ObjectId().toString();
      await expect(TaskService.toggleStatus({ _id: fakeId })).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("getAll", () => {
    it("should return all tasks without applying any filters", async () => {
      await new Task(createMockTaskDocument({ title: "Task1" })).save();
      await new Task(createMockTaskDocument({ title: "Task2" })).save();

      const result = await TaskService.getAll({
        page: 1,
        limit: 10,
      });
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.title)).toEqual(
        expect.arrayContaining(["Task1", "Task2"]),
      );
    });

    it("should apply a filter for status", async () => {
      await new Task(createMockTaskDocument({ status: "open" })).save();
      await new Task(createMockTaskDocument({ status: "completed" })).save();

      const result = await TaskService.getAll({
        page: 1,
        limit: 10,
        status: "completed",
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("completed");
    });

    it("should apply a filter for category", async () => {
      await new Task(createMockTaskDocument({ category: "red graaal" })).save();
      await new Task(
        createMockTaskDocument({ category: "green grass" }),
      ).save();

      const result = await TaskService.getAll({
        page: 1,
        limit: 10,
        category: "green grass",
      });
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("green grass");
    });

    it("should apply a filter for assignedTo", async () => {
      const userHi = new Types.ObjectId();
      const userBy = new Types.ObjectId();

      await Task.create(createMockTaskDocument({ assignedTo: userHi }));
      await Task.create(createMockTaskDocument({ assignedTo: userBy }));

      const result = await TaskService.getAll({
        page: 1,
        limit: 10,
        assignedTo: userBy.toString(),
      });
      expect(result).toHaveLength(1);
      expect(String(result[0].assignedTo)).toEqual(String(userBy));
    });

    it("should paginate the correct way", async () => {
      await new Task(createMockTaskDocument({ title: "Task1" })).save();
      await new Task(createMockTaskDocument({ title: "Task2" })).save();
      await new Task(createMockTaskDocument({ title: "Task3" })).save();

      const result = await TaskService.getAll({
        page: 1,
        limit: 2,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("getTasksByBoard", () => {
    it("should return tasks for a specific task board", async () => {
      const taskboard1 = new Types.ObjectId();
      const taskboard2 = new Types.ObjectId();

      // For board 1
      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard1, title: "1.1" }),
      ).save();
      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard1, title: "1.2" }),
      ).save();

      // For board 2
      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard2, title: "2.1" }),
      ).save();

      const result = await TaskService.getTasksByBoard({
        boardId: taskboard1.toString(),
        page: 1,
        limit: 10,
      });
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.title)).toEqual(
        expect.arrayContaining(["1.1", "1.2"]),
      );
    });

    it("should apply pagination", async () => {
      const taskboard = new Types.ObjectId();

      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard, title: "Task1" }),
      ).save();
      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard, title: "Task2" }),
      ).save();
      await new Task(
        createMockTaskDocument({ taskBoardId: taskboard, title: "Task3" }),
      ).save();

      const result = await TaskService.getTasksByBoard({
        boardId: taskboard.toString(),
        page: 1,
        limit: 2,
      });

      expect(result).toHaveLength(2);
      expect(
        result.some((task) => ["Task1", "Task2", "Task3"].includes(task.title)),
      ).toBe(true);
    });

    it("should give an empty array if no tasks can be found", async () => {
      const result = await TaskService.getTasksByBoard({
        boardId: new Types.ObjectId().toString(),
        page: 1,
        limit: 5,
      });

      expect(result).toEqual([]);
    });
  });

  describe("getNumberOfTasks", () => {
    const dummyUserId = new Types.ObjectId();
    it("should count the tasks of a certain status", async () => {
      await new Task(
        createMockTaskDocument({
          status: "completed",
          assignedTo: dummyUserId,
        }),
      ).save();
      await new Task(
        createMockTaskDocument({ status: "open", assignedTo: dummyUserId }),
      ).save();

      const numComp = await TaskService.getNumberOfTasks({
        id: dummyUserId.toString(),
        status: "completed",
      });
      expect(numComp).toBe(1);
    });

    it("should count the tasks that are overdue", async () => {
      await Task.create(
        createMockTaskDocument({
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // task 2 days ago
          assignedTo: dummyUserId,
        }),
      );

      await Task.create(
        createMockTaskDocument({
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // task 2 days from now
          assignedTo: dummyUserId,
        }),
      );

      const numDue = await TaskService.getNumberOfTasks({
        id: dummyUserId.toString(),
        overdue: true,
      });
      expect(numDue).toBe(1);
    });

    it("should count tasks that were created in the last 24 hours", async () => {
      await new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      ).save(); // new task

      const olderTask = new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      );
      olderTask.createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // task 3 days ago
      await olderTask.save();

      const num24h = await TaskService.getNumberOfTasks({
        id: dummyUserId.toString(),
        createdInLast: "24 Hours",
      });
      expect(num24h).toBe(1);
    });

    it("should count tasks that were created in the last 1 week", async () => {
      await new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      ).save(); // new task

      const oldTask = new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      );
      oldTask.createdAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // task 10 days ago
      await oldTask.save();

      const numWeek = await TaskService.getNumberOfTasks({
        id: dummyUserId.toString(),
        createdInLast: "1 Week",
      });
      expect(numWeek).toBe(1);
    });

    it("should count all tasks that were when createdInLast is in the 'All Time' category", async () => {
      await new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      ).save();
      await new Task(
        createMockTaskDocument({ assignedTo: dummyUserId }),
      ).save();

      const numEver = await TaskService.getNumberOfTasks({
        id: dummyUserId.toString(),
        createdInLast: "All Time",
      });
      expect(numEver).toBe(2);
    });
  });
});
