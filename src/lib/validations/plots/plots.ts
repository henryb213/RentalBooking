import { z } from "zod";

export const plotCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  size: z.number().positive().min(1).max(5000),
  location: z.string(),
  condition: z.enum(["", "Full Sun", "Partial Sun", "No sun"]),
  soilPh: z.enum([
    "",
    "Neutral: 6.5 - 7.5",
    "Acidic: < 6.5",
    "Alkaline: > 7.5",
  ]),
  soilType: z.enum(["", "Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"]),
  gardenSetting: z.enum(["", "Back garden", "Front garden", "Other"]),
  groupType: z.enum(["", "Communal", "Private"]).optional(),
  requiredTasks: z
    .array(
      z.object({
        tType: z.enum([
          "Watering",
          "Weeding",
          "Harvesting",
          "Planting",
          "Pruning",
          "Mowing",
          "Other",
        ]),
        frequency: z.enum(["Daily", "Weekly", "Monthly"]),
        duration: z.enum([
          "15-30 minutes",
          "30-60 minutes",
          "1-2 hours",
          "2-4 hours",
          "4+ hours",
        ]),
      }),
    )
    .optional(),
  plants: z
    .array(
      z.enum([
        "Perennial",
        "Shrubs",
        "Climbers",
        "Bulbs",
        "Mature-shrubs",
        "Grasses",
        "Flowers",
        "Ferns",
        "Fruit",
        "Herbs",
        "Vegetables",
        "Hedging",
        "Trees",
        "Indoor-plants",
        "Soil",
        "Seeds",
      ]),
    )
    .optional(),
  ownerId: z.string(),
  memberLimit: z.number().positive().max(30).optional(), // Ensure memberLimit is optional
  images: z.array(
    z.object({
      url: z.string(),
      isMain: z.boolean(),
    }),
  ),
});

export const plotUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(500).optional(),
  size: z.number().positive().min(1).max(5000).optional(),
  location: z.string().optional(),
  condition: z.enum(["Full Sun", "Partial Sun", "No sun"]).optional(),
  status: z.enum(["available", "full", "maintenance"]).optional(),
  soilPh: z
    .enum(["Neutral: 6.5 - 7.5", "Acidic: < 6.5", "Alkaline: > 7.5"])
    .optional(),
  soilType: z
    .enum(["Sand", "Clay", "Silt", "Peat", "Chalk", "Loam"])
    .optional(),
  gardenSetting: z
    .enum(["", "Back garden", "Front garden", "Other"])
    .optional(),
  groupType: z.enum(["", "Communal", "Private"]).optional(),
  requiredTasks: z
    .array(
      z.object({
        tType: z.enum([
          "Watering",
          "Weeding",
          "Harvesting",
          "Planting",
          "Pruning",
        ]),
        frequency: z.enum(["Daily", "Weekly", "Monthly"]),
        duration: z.enum([
          "15-30 minutes",
          "30-60 minutes",
          "1-2 hours",
          "2-4 hours",
          "4+ hours",
        ]),
      }),
    )
    .optional(),
  plants: z
    .array(
      z.enum([
        "Perennial",
        "Shrubs",
        "Climbers",
        "Bulbs",
        "Mature-shrubs",
        "Grasses",
        "Flowers",
        "Ferns",
        "Fruit",
        "Herbs",
        "Vegetables",
        "Hedging",
        "Trees",
        "Indoor-plants",
        "Soil",
        "Seeds",
      ]),
    )
    .optional(),
  ownerId: z.string(),
  memberLimit: z.number().positive().max(30).optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        isMain: z.boolean(),
      }),
    )
    .optional(),
});
