import { connectDB } from "@/lib/mongo";
import mongoose from "mongoose";
import z from "zod";
import {
  getFolderSchema,
  createFolderSchema,
  deleteFolderSchema,
  renameFolderSchema,
  addSubfolderSchema,
  getIdByPathSchema,
} from "@/lib/validations/folder";
import { IFolderD } from "@/types/folder";
import { Folder } from "@/lib/models";

export class FolderService {
  static async getIdByPath(
    input: z.infer<typeof getIdByPathSchema>,
  ): Promise<IFolderD> {
    await connectDB();
    const folder = await Folder.findOne(input);
    return folder.toObject();
  }

  static async getFolders(
    input: z.infer<typeof getFolderSchema>,
  ): Promise<{ folders: IFolderD[]; hasNextPage: boolean }> {
    await connectDB();
    const { path, page, limit, createdBy } = input;
    const curFolder = await FolderService.getIdByPath({
      path: path,
      createdBy: createdBy,
    });
    const query = {
      parentFolderId: curFolder._id,
      $or: [{ createdBy: input.createdBy }, { plotId: { $in: input.plotIds } }],
    };

    const folders = await Folder.find<IFolderD>(query)
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .lean<IFolderD[]>();

    const hasNextPage = folders.length > limit;
    const paginatedFolders = hasNextPage ? folders.slice(0, -1) : folders;

    return {
      folders: paginatedFolders,
      hasNextPage,
    };
  }
  static async createFolder(
    input: z.infer<typeof createFolderSchema>,
  ): Promise<IFolderD | null> {
    await connectDB();

    // Check if a folder with the same name, path, and owner already exists
    const existingFolder = await Folder.findOne({
      name: input.name,
      path: input.path,
      createdBy: input.createdBy,
    });

    if (existingFolder) {
      console.error("Folder name already exists at this path");
      return null; // Return null if a folder with the same name, path, and owner already exists
    }

    // Create folder with optional fields
    const folder = await Folder.create<IFolderD>({
      ...input,
    });

    return folder.toObject();
  }

  static async deleteFolder(
    input: z.infer<typeof deleteFolderSchema>,
  ): Promise<boolean> {
    await connectDB();
    const { folderId } = input;

    // Recursive function to delete all subfolders
    async function deleteSubfolders(id: mongoose.Types.ObjectId) {
      const folder: IFolderD | null = await Folder.findById(id);
      if (folder && folder?.subfolders && folder.subfolders.length > 0) {
        await Promise.all(
          folder.subfolders.map((subfolderId: mongoose.Types.ObjectId) =>
            deleteSubfolders(subfolderId),
          ),
        );
      }
      await Folder.deleteOne({ _id: id });
    }

    await deleteSubfolders(new mongoose.Types.ObjectId(folderId));
    return true;
  }

  static async renameFolder(
    input: z.infer<typeof renameFolderSchema>,
  ): Promise<IFolderD | null> {
    await connectDB();
    const { folderId, newName } = input;

    // Update folder name
    const folder = await Folder.findByIdAndUpdate<IFolderD>(
      folderId,
      { name: newName, updatedAt: new Date() },
      { new: true },
    );

    return folder?.toObject();
  }

  static async addSubfolder(
    input: z.infer<typeof addSubfolderSchema>,
  ): Promise<boolean> {
    await connectDB();
    const { parentFolderId, subfolderId } = input;

    const parentFolder = await Folder.findById(parentFolderId);
    if (!parentFolder) return false;

    // Add subfolder to the subfolders array if it doesn't already exist
    if (
      !parentFolder.subfolders.includes(
        new mongoose.Types.ObjectId(subfolderId),
      )
    ) {
      parentFolder.subfolders.push(new mongoose.Types.ObjectId(subfolderId));
      await parentFolder.save();
    }

    return true;
  }
}
