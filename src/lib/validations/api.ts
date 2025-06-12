import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});
