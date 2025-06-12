// eslint-disable-next-line @typescript-eslint/no-empty-interface
import { Model, Types, Document } from "mongoose";

interface IBorrowHistoryEntry {
  userId: Types.ObjectId;
  borrowDate: Date;
  returnDate?: Date;
  condition?: string;
}

interface IMaintenanceLogEntry {
  date: Date;
  description?: string;
  performedBy: Types.ObjectId;
}

// Tool interface definition
export interface ITool extends Document {
  name: string;
  description?: string;
  imageSrc?: string;
  category: string;
  location: Location;
  condition: "new" | "excellent" | "good" | "fair" | "poor";
  availability?: "available" | "borrowed" | "maintenance";
  ownerId: Types.ObjectId;
  currentBorrower?: {
    userId: Types.ObjectId;
    borrowDate: Date;
    expectedReturnDate: Date;
  };
  borrowHistory: IBorrowHistoryEntry[];
  maintenanceLog: IMaintenanceLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IToolD extends ITool, Document {}
//export interface IToolM extends Model<IToolD> {}
