import mongoose, { Document, Model } from "mongoose";

export interface IFolder {
  path: string;
  name: string;
  createdBy: mongoose.Types.ObjectId;
  description?: string;
  taskBoardId?: mongoose.Types.ObjectId[];
  subfolders?: mongoose.Types.ObjectId[];
  plotId?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  parentFolderId?: mongoose.Types.ObjectId;
}

export interface IFolderD extends IFolder, Document {}

// eslint-disable-next-line
export interface IFolderM extends Model<IFolderD> {}
