import { z } from "zod";

export const userProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

export const userAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postCode: z.string().optional(),
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z
    .enum(["admin", "plotOwner", "communityMember"])
    .default("communityMember"),
  points: z.number().min(0).default(100).optional(),
  notificationCount: z.number().min(0).default(0).optional(),
  profile: userProfileSchema.optional(),
  address: userAddressSchema.optional(),
  favouritePlots: z.array(z.string()).default([]).optional(),
  verified: z.boolean().default(false),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(["admin", "plotOwner", "communityMember"]).optional(),
  points: z.number().min(0).optional(),
  profile: userProfileSchema.optional(),
  address: userAddressSchema.optional(),
  favouritePlots: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  firstGardenLent: z.boolean().optional(),
  firstGardenJoined: z.boolean().optional(),
});
