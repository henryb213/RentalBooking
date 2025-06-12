import { z } from "zod";
import { paginationSchema } from "@/lib/validations/api";
import mongoose from "mongoose";

export const getFolderSchema = z.object({
  ...paginationSchema.shape,
  path: z.string().min(1, "Path is required"),
  plotIds: z
    .array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id)))
    .optional(),
  createdBy: z.string(),
});

export const createFolderSchema = z.object({
  createdBy: z.string(),
  path: z.string().min(1, "Path is required"),
  name: z.string().min(1, "Folder name is required"),
  plotId: z
    .string()
    .optional()
    .refine((id) => !id || mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid plot ID",
    }),
  description: z.string().optional(),
  parentFolderId: z
    .string()
    .optional()
    .refine((id) => !id || mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid parent folder ID",
    }),
});

export const deleteFolderSchema = z.object({
  folderId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid folder ID",
  }),
});

export const renameFolderSchema = z.object({
  folderId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid folder ID",
  }),
  newName: z.string().min(1, "New folder name is required"),
});

export const getIdByPathSchema = z.object({
  path: z.string(),
  createdBy: z.string(),
});

export const addSubfolderSchema = z.object({
  parentFolderId: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid parent folder ID",
    }),
  subfolderId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid subfolder ID",
  }),
});
