import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

import { demoRouter } from "@/server/api/routers/demo";
import { plotRouter } from "./routers/plots";
import { toolRouter } from "./routers/tools";
import { taskRouter } from "./routers/tasks";
import { taskBoardRouter } from "./routers/taskboards";
import { marketplaceRouter } from "./routers/marketplace";
import { userRouter } from "./routers/user";
import { folderRouter } from "./routers/folders";
import { imageRouter } from "./routers/image";
import { notificationRouter } from "./routers/notification";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  demo: demoRouter,
  user: userRouter,
  plots: plotRouter,
  tools: toolRouter,
  tasks: taskRouter,
  folders: folderRouter,
  taskboards: taskBoardRouter,
  marketplace: marketplaceRouter,
  image: imageRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
