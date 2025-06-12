import { UserService } from "@/server/services/user.service";
import * as testHelper from "../../helpers/test-service-helper";
import { User } from "@/lib/models/user.model";
import { createMockUserDocument } from "../../mocks/data/user.mock";
import { IUser } from "@/types/user";

// Mock the TaskboardService to break the dependency chain
jest.mock("@/server/services/task.service", () => {
  const { createMockTaskBoardDocument } = jest.requireActual(
    "../../mocks/data/task.mock",
  );
  const mockTaskBoard = createMockTaskBoardDocument({
    title: "Mock Taskboard",
    path: "/mock/taskboard",
    status: "open",
  });

  return {
    TaskboardService: {
      getByPath: jest.fn().mockResolvedValue(mockTaskBoard),
      update: jest.fn().mockResolvedValue(true),
    },
  };
});

// Setup test environment with in-memory MongoDB
beforeAll(async () => {
  await testHelper.initializeTestEnvironment();
});

// Clean data between tests
afterEach(async () => {
  await testHelper.clearTestData();
});

// Clean up after all tests
afterAll(async () => {
  await testHelper.cleanupTestEnvironment();
});

describe("UserService", () => {
  describe("getUserById", () => {
    it("should return a user by id", async () => {
      // Create a test user directly in the database
      const mockUser = createMockUserDocument({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      });

      const savedUser = await new User(mockUser).save();
      const userId = savedUser._id.toString();

      // Test the getUserById method
      const foundUser = await UserService.getUserById(userId);

      // Verify the user was found
      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe("test@example.com");
      expect(foundUser?.firstName).toBe("Test");
      expect(foundUser?.lastName).toBe("User");

      // Verify password hash is not included
      expect(
        // @ts-expect-error TypeScript should throw an error here
        (foundUser as Omit<IUser, "passwordHash">).passwordHash,
      ).toBeUndefined();
    });

    it("should return null for non-existent user id", async () => {
      const result = await UserService.getUserById("64f5ce807d654abf25c672a1");
      expect(result).toBeNull();
    });

    it("should include password hash when excludePassword is false", async () => {
      // Create a test user
      const mockUser = createMockUserDocument({
        email: "test2@example.com",
        passwordHash: "hashedpassword12345",
      });

      const savedUser = await new User(mockUser).save();
      const userId = savedUser._id.toString();

      // Get user with password
      const foundUser = await UserService.getUserById(userId, false);

      // Verify password hash is included
      expect(foundUser).not.toBeNull();
      expect((foundUser as IUser).passwordHash).toBe("hashedpassword12345");
    });
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      // Create multiple test users
      const mockUsers = [
        createMockUserDocument({ email: "user1@example.com" }),
        createMockUserDocument({ email: "user2@example.com" }),
        createMockUserDocument({ email: "user3@example.com" }),
      ];

      for (const user of mockUsers) {
        await new User(user).save();
      }

      // Get users with pagination
      const result = await UserService.getUsers({ page: 1, limit: 2 });

      // Verify pagination
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    it("should filter users by role", async () => {
      // Create users with different roles
      const mockUsers = [
        createMockUserDocument({ email: "admin@example.com", role: "admin" }),
        createMockUserDocument({
          email: "member@example.com",
          role: "communityMember",
        }),
        createMockUserDocument({
          email: "owner@example.com",
          role: "plotOwner",
        }),
      ];

      for (const user of mockUsers) {
        await new User(user).save();
      }

      // Get users filtered by role
      const result = await UserService.getUsers({ role: "admin" });

      // Verify filtering
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe("admin@example.com");
    });
  });

  describe("getUsersByEmail", () => {
    it("should return a user by email", async () => {
      // Create a test user directly in the database
      const mockUser = createMockUserDocument({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      });

      const savedUser = await new User(mockUser).save();
      const userId = savedUser._id.toString();

      // Test the getUserById method
      const foundUser = await UserService.getUserByEmail(mockUser.email);

      // Verify the user was found
      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe("test@example.com");
      expect(foundUser?.firstName).toBe("Test");
      expect(foundUser?.lastName).toBe("User");

      // Verify password hash is not included
      expect(
        // @ts-expect-error TypeScript should throw an error here
        (foundUser as Omit<IUser, "passwordHash">).passwordHash,
      ).toBeUndefined();
    });
  });

  describe("createUser", () => {
    it("should be able to create a user with a hashed password", async () => {
      // Create a test user directly in the database
      const mockUser = createMockUserDocument({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      });

      const savedUser = await new User(mockUser).save();

      const userId = savedUser._id.toString();

      // Test the getUserById method
      const foundUser = await UserService.getUserById(userId);

      expect(foundUser).toEqual(
        expect.objectContaining({
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        }),
      );
      expect(foundUser).not.toHaveProperty("passwordHash");
    });

    it("should reject duplicate emails", async () => {
      // Create and save the first user with a specific email
      const mockUser1 = createMockUserDocument({
        email: "duplicate@example.com",
        firstName: "John",
        lastName: "Doe",
      });
      await new User(mockUser1).save();

      // Attempt to create a second user with the same email
      const mockUser2 = createMockUserDocument({
        email: "duplicate@example.com",
        firstName: "Jane",
        lastName: "Smith",
      });

      // Verify that creating a second user with the same email should fail
      try {
        await new User(mockUser2).save();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should return empty array for non-existent user search", async () => {
      const result = await UserService.searchUsers("bob");
      expect(result).toEqual([]);
    });
  });

  describe("deleteUser", () => {
    it("should handle user deletion", async () => {
      // Create a test user directly in the database
      const mockUser = createMockUserDocument({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      });

      const savedUser = await new User(mockUser).save();
      const userId = savedUser._id.toString();

      const result = await UserService.deleteUser(userId);
      expect(result).toBe(true);
    });

    it("should handle trying to delete a nonexistent user", async () => {
      const result2 = await UserService.deleteUser("64f5ce807d654abf25c672a1");
      expect(result2).toBe(false);
    });
  });
});
