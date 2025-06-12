// Import the MongoDB mock
import "./mocks/mongo-mock";

// Set the environment variable for tests
process.env.MONGODB_URI = "mongodb://in-memory";

// Extend Jest matchers if needed
// (You could add custom matchers here)
