import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Connect to the in-memory database
export const connect = async (): Promise<typeof mongoose> => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connection options that match production settings
    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, mongooseOptions);
    console.log("Connected to in-memory MongoDB successfully");
    return mongoose;
  } catch (error) {
    console.error("Error connecting to in-memory MongoDB:", error);
    throw error;
  }
};

// Close the database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("Closed in-memory MongoDB connection");
  } catch (error) {
    console.error("Error closing in-memory MongoDB connection:", error);
    throw error;
  }
};

// Clear all collections
export const clearDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState) {
      const collections = mongoose.connection.collections;

      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      console.log("Cleared all collections in the database");
    }
  } catch (error) {
    console.error("Error clearing in-memory MongoDB collections:", error);
    throw error;
  }
};

// Mock for the connectDB function in the application
export const connectDB = jest.fn().mockImplementation(async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      return connect();
    }
    return mongoose;
  } catch (error) {
    console.error("Error in mocked connectDB:", error);
    throw error;
  }
});

// Mock for the disconnectDB function
export const disconnectDB = jest.fn().mockImplementation(async () => {
  try {
    return closeDatabase();
  } catch (error) {
    console.error("Error in mocked disconnectDB:", error);
    throw error;
  }
});

// Mock for the getMongoClient function
export const getMongoClient = jest.fn().mockImplementation(() => {
  try {
    return {
      db: () => mongoose.connection.db,
    };
  } catch (error) {
    console.error("Error in mocked getMongoClient:", error);
    throw error;
  }
});

// Setup jest.mock directive
jest.mock("@/lib/mongo", () => ({
  connectDB,
  disconnectDB,
  getMongoClient,
}));
