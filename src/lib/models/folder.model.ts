import { IFolderD, IFolderM } from "@/types/folder";
import { Schema, model, models } from "mongoose";

const FolderSchema = new Schema<IFolderD, IFolderM>(
  {
    taskBoardId: [{ type: Schema.Types.ObjectId, ref: "TaskBoard" }],
    path: { type: String, required: true },
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
    subfolders: [{ type: Schema.Types.ObjectId, ref: "Folder" }],
    parentFolderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    plotId: { type: Schema.Types.ObjectId, ref: "Plot" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Folders",
  },
);

const Folder =
  models.Folder<IFolderD> || model<IFolderD>("Folder", FolderSchema);
export { Folder };
