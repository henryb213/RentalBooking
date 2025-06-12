import mongoose from "mongoose";
import { MongoClient, MongoClientOptions } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var mongoConnection: {
    mongoose: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
    mongoClient: {
      client: MongoClient | null;
      promise: Promise<MongoClient> | null;
    };
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable!");
}

const cached =
  global.mongoConnection ??
  (global.mongoConnection = {
    mongoose: { conn: null, promise: null },
    mongoClient: { client: null, promise: null },
  });

export async function getMongoClientAsync() {
  if (cached?.mongoClient.client) {
    return cached.mongoClient.client;
  }

  if (!cached?.mongoClient.client) {
    const opts: MongoClientOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.mongoClient.promise = MongoClient.connect(MONGODB_URI!, opts) //
      .then((client) => {
        console.log("New MongoDB client connection established");
        return client;
      })
      .catch((error) => {
        console.error("MongoDB client connection error", error);
        cached!.mongoClient.promise = null;
        throw error;
      });
  }

  try {
    cached!.mongoClient.client = await cached!.mongoClient.promise;
  } catch (e) {
    cached!.mongoClient.promise = null;
    throw e;
  }

  return cached!.mongoClient.client;
}

export function getMongoClient() {
  if (!cached?.mongoClient.client) {
    getMongoClientAsync();
    if (cached.mongoClient.promise) {
      return cached.mongoClient.promise;
    }
    throw new Error("MongoDB client has not been initialized");
  }

  return cached.mongoClient.client;
}

export async function connectDB() {
  if (cached?.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached?.mongoose.promise) {
    const opts: MongoClientOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.mongoose.promise = mongoose //
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("New Mongoose connection established");
        return mongoose;
      })
      .catch((error) => {
        console.error("Mongoose connection error: ", error);
        cached!.mongoose.promise = null;
        throw error;
      });
  }

  try {
    cached!.mongoose.conn = await cached!.mongoose.promise;
  } catch (e) {
    cached!.mongoose.promise = null;
    throw e;
  }
}

// Only add event listeners in production
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

async function cleanup() {
  try {
    if (cached.mongoose.conn) {
      await cached.mongoose.conn.disconnect();
      cached.mongoose.conn = null;
      cached.mongoose.promise = null;
      console.log("Mongoose connection closed");
    }

    if (cached.mongoClient.client) {
      await cached.mongoClient.client.close();
      cached.mongoClient.client = null;
      cached.mongoClient.promise = null;
      console.log("MongoDB client connection closed");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    process.exit(0);
  }
}

// For Next.js App Router
export async function closeConnections() {
  await Promise.all([
    cached.mongoose.conn?.disconnect(),
    cached.mongoClient.client?.close(),
  ]);

  cached.mongoose.conn = null;
  cached.mongoose.promise = null;
  cached.mongoClient.client = null;
  cached.mongoClient.promise = null;
}
