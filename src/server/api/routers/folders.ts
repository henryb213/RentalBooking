import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { FolderService } from "@/server/services/folder.service";
import {
  getFolderSchema,
  createFolderSchema,
  deleteFolderSchema,
  renameFolderSchema,
  addSubfolderSchema,
  getIdByPathSchema,
} from "@/lib/validations/folder";
import { connectDB } from "@/lib/mongo";
import { Folder } from "@/lib/models";
import { IFolderD } from "@/types/folder";
import { TRPCError } from "@trpc/server";

export const folderRouter = createTRPCRouter({
  getFolders: publicProcedure
    .input(getFolderSchema)
    .query(async ({ input }) => {
      const folders = await FolderService.getFolders(input);
      return folders;
    }),

  create: publicProcedure
    .input(createFolderSchema)
    .mutation(async ({ input }) => {
      if (input.path === "/plots/" || input.path.match(/^\/plots\/[^\/]+\//)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot add folder to plots",
        });
      }
      const folder = await FolderService.createFolder(input);
      return folder;
    }),

  rename: publicProcedure
    .input(renameFolderSchema)
    .mutation(async ({ input }) => {
      const updatedFolder = await FolderService.renameFolder(input);
      return updatedFolder;
    }),

  getIdByPath: publicProcedure
    .input(getIdByPathSchema)
    .query(async ({ input }) => {
      const folder = await FolderService.getIdByPath(input);
      return folder;
    }),

  delete: publicProcedure
    .input(deleteFolderSchema)
    .mutation(async ({ input }) => {
      await connectDB();
      const folder: IFolderD | null = await Folder.findById(
        input.folderId,
      ).lean<IFolderD>();
      if (!folder) {
        return { success: false };
      }
      if (folder.path.startsWith("/plots/")) {
        console.log("Cannot delete plots folder");
        return { success: false };
      }

      const success = await FolderService.deleteFolder(input);
      return { success };
    }),

  addSubfolder: publicProcedure
    .input(addSubfolderSchema)
    .mutation(async ({ input }) => {
      const success = await FolderService.addSubfolder(input);
      return { success };
    }),
});
