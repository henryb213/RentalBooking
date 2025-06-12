import { z } from "zod";

export const listingCreateSchema = z.object({
  name: z.string().min(2).max(100),
  path: z.string().min(0).max(100).optional(),
  price: z.number().min(0),
  quantity: z.number().min(1).optional().default(1),
  type: z.enum(["item", "service", "share"]).default("item"),
  category: z.string(),
  status: z.enum(["open"]).default("open"),
  imageUrls: z.array(z.string()).optional(),
  description: z.string(),
  pickupmethod: z.enum(["myloc", "post"]),
  createdBy: z.string(),
  postcode: z.string().min(3),
  purchasedBy: z.string().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const listingUpdateSchema = listingCreateSchema
  .extend({
    status: z.enum(["open", "closed"]),
  })
  .partial();
