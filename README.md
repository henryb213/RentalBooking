# CS3099 JH Project

A modern web application built with Next.js 14, featuring authentication, MongoDB integration, and a marketplace system.

## 🚀 Features

- ⚡ Next.js 14 with App Router
- 🔐 Authentication with NextAuth.js
- 🗄️ MongoDB database integration
- 🎨 Tailwind CSS for styling
- 🔄 tRPC for type-safe API calls
- 📱 Responsive design
- 🌙 Dark mode support
- 🧪 Jest for testing
- 🐳 Docker support for development

## 📋 Prerequisites

- Node.js 22+ (use `UpdateNode.sh` script for lab computers)
- npm or yarn
- MongoDB instance
- Docker (optional, for containerized development)

### Node.js Installation (Lab Computers)

For lab computers, you need to update Node.js to version 22. Run the following commands:

```bash
sh UpdateNode.sh
source ~/.bash_profile  # or restart your terminal
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://git-ci.cs.st-andrews.ac.uk/cs3099sg3/project-code.git
cd project-code
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🐳 Docker Development

Start the development environment with Docker:
```bash
docker compose -f docker-compose.dev.yml up -d
```

Stop the development environment:
```bash
docker compose -f docker-compose.dev.yml down
```

## 🧪 Testing

The project uses Jest for testing with the following capabilities:

### Running Tests

```bash
npm test
```

### Test Structure

- Tests are located in the `tests/` directory
- Jest configuration is in `jest.config.js`
- Uses `ts-jest` for TypeScript support
- Includes `mongodb-memory-server` for database testing
- Uses `supertest` for API endpoint testing and HTTP assertions

### Test Setup

The project uses a centralized test setup in `tests/setup.ts` which:
- Imports MongoDB mocks
- Sets up test environment variables
- Configures global test settings

### MongoDB Testing

The project includes a comprehensive MongoDB testing setup:

1. **In-Memory Database**
   ```typescript
   // Example from mongo-mock.ts
   export const connect = async (): Promise<typeof mongoose> => {
     mongoServer = await MongoMemoryServer.create();
     const uri = mongoServer.getUri();
     await mongoose.connect(uri, mongooseOptions);
     return mongoose;
   };
   ```

2. **Database Management**
   - `connect()`: Establishes connection to in-memory MongoDB
   - `closeDatabase()`: Closes database connection and stops server
   - `clearDatabase()`: Clears all collections
   - `connectDB()`: Mocked database connection function
   - `disconnectDB()`: Mocked database disconnection function

### Test Helpers

The project includes a test service helper (`test-service-helper.ts`) that provides:
- Environment initialization
- Test data management
- Service testing utilities

### Unit Tests

The project focuses on service-level unit tests:

1. **Service Tests**
   ```typescript
   // Example from tasks.test.ts
   describe("TaskService", () => {
     describe("create", () => {
       it("should create a task", async () => {
         const mockTask = createMockTaskDocument({
           title: "Test Task",
           description: "This is a test task",
         });
         const createdTask = await new Task(mockTask).save();
         expect(createdTask).toBeDefined();
         expect(createdTask.title).toBe("Test Task");
       });
     });
   });
   ```

2. **Mock Data**
   - Mock data is stored in `tests/mocks/data/`
   - Includes factory functions for creating test documents
   - Supports different test scenarios

3. **Test Lifecycle**
   ```typescript
   beforeAll(async () => {
     await testHelper.initializeTestEnvironment();
   });

   afterEach(async () => {
     await testHelper.clearTestData();
   });

   afterAll(async () => {
     await testHelper.cleanupTestEnvironment();
   });
   ```

### Test Coverage

To generate a coverage report:
```bash
npm test -- --coverage
```

## 📦 Build

Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🧹 Code Quality

Lint the code:
```bash
npm run lint
```

Format the code:
```bash
npm run format
```

## 📁 Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React frontend components
├── data/             # Mosaic data processing
├── docs/             # Project documentation
├── lib/              # Utility functions and configurations
├── public/           # Static assets
├── server/           # Server-side code
│   ├── api/          # API handlers
│   └── services/     # Business logic services
├── styles/           # Global styles
├── trpc/             # tRPC router and procedures
├── types/            # TypeScript type definitions
└── providers/        # React context providers
```

## 🔧 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **API**: tRPC
- **Testing**: Jest
- **Containerization**: Docker

## 📚 Documentation

For more information about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
